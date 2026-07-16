# Real-Time Driver Allocation System

A backend service built with **NestJS**, **PostgreSQL**, and **Redis** that simulates the core workflow of a ride-hailing platform. The system performs geo-based driver discovery, handles concurrent driver acceptance requests safely, retries allocation when no driver accepts, and guarantees that only one driver can be assigned to a ride.

---

## Features

* Driver registration
* Real-time driver location updates using Redis GEO
* Geo-based nearby driver search
* Ride creation and allocation
* Simulated driver notification using Redis Sets
* Atomic ride assignment using a Redis Lua script
* Idempotent ride acceptance
* Retry allocation with an expanded search radius
* Automatic timeout when no additional drivers are available
* Concurrency test demonstrating race-condition safety

---

## Technology Stack

* **Backend:** NestJS (TypeScript)
* **Database:** PostgreSQL
* **Cache / Geo Search:** Redis
* **ORM:** TypeORM
* **Containerization:** Docker Compose

---

## System Architecture
<img width="754" height="573" alt="Ride booking architecture" src="https://github.com/user-attachments/assets/cf6f6f5a-b1be-4691-bf85-3636bf60ea9e" />

### Data Flow
```text
                    Rider Request
                         │
                         ▼
                 Create Ride (PostgreSQL)
                         │
                         ▼
              Redis GEO Nearby Search
                         │
                         ▼
      Notify Nearby Drivers (Redis Set)
                         │
                         ▼
        Driver Accept Request (Concurrent)
                         │
                         ▼
      Redis Lua Script (Atomic Assignment)
                │                    │
         Assignment Won        Assignment Lost
                │                    │
                ▼                    ▼
      Update Ride Status       Reject Request
                │
                ▼
          ASSIGNED / RETRYING / TIMEOUT
```

---

## Ride Lifecycle

```text
REQUESTED
     │
     ▼
SEARCHING
     │
     ├──────────────► ASSIGNED
     │
     ▼
RETRYING
     │
     ├──────────────► ASSIGNED
     │
     ▼
TIMEOUT
```

Additional state introduced:

* **RETRYING** – Ride is being reallocated after the initial search expires.

---

## Redis Data Structures

### GEO Set

Stores the latest driver locations.

```text
drivers:geo
```

Used for:

* Driver location updates
* Nearby driver discovery

---

### Notification Set

Tracks which drivers have already been notified for a ride.

```text
ride:<rideId>:notified
```

This prevents notifying the same driver multiple times during retries.

---

### Assignment Lock

```text
ride:<rideId>:assignment
```

Created atomically using a Redis Lua script.

Guarantees that:

* Only one driver can win the assignment.
* Duplicate requests from the winning driver are idempotent.
* Other drivers cannot overwrite the assignment.

---

## Concurrency Handling

Multiple drivers may attempt to accept the same ride simultaneously.

To prevent race conditions, the assignment logic is implemented using a **Redis Lua script**, which executes atomically inside Redis.

Possible outcomes:

* **1** → Driver successfully assigned.
* **2** → Duplicate request from the same driver (idempotent).
* **0** → Ride already assigned to another driver.

This guarantees that exactly one driver is assigned even under heavy concurrent load.

---

## Retry Logic

1. Search for nearby drivers within **5 km**.
2. Notify all discovered drivers.
3. Wait **15 seconds**.
4. If no driver accepts:

   * Expand the search radius to **10 km**.
   * Notify only newly discovered drivers.
5. If no additional drivers are found, mark the ride as **TIMEOUT**.

---

## Project Setup

### Prerequisites

* Node.js
* Docker
* Docker Compose

### Install Dependencies

```bash
npm install
```

### Start PostgreSQL and Redis

```bash
docker compose up -d
```

### Run the Application

```bash
npm run start:dev
```

---

## API Endpoints

### Create Driver

```http
POST /drivers
```

Example:

```json
{
  "name": "Driver 1"
}
```

---

### Update Driver Location

```http
POST /drivers/location
```

Example:

```json
{
  "driverId": "<driver-id>",
  "latitude": 12.9716,
  "longitude": 77.5946
}
```

---

### Get Drivers

```http
GET /drivers
```

---

### Create Ride

```http
POST /rides
```

Example:

```json
{
  "riderName": "John",
  "pickupLatitude": 12.9716,
  "pickupLongitude": 77.5946
}
```

---

### Accept Ride

```http
POST /rides/:rideId/accept
```

Example:

```json
{
  "driverId": "<driver-id>"
}
```

---

### Get All Rides

```http
GET /rides
```

---

## Concurrency Verification

A concurrency test script is included to verify that only one driver can successfully accept a ride.

Run:

```bash
npm run concurrency
```

Expected output:

* One request succeeds with **201 Created**.
* Remaining requests fail with **400 Bad Request**.
* The ride is assigned to exactly one driver.

---

## Design Decisions

### Driver Notification

Driver notification is simulated using a Redis Set (`ride:<rideId>:notified`) rather than WebSockets or Server-Sent Events.

This approach satisfies the assignment requirement while keeping the focus on reliable concurrency handling and deterministic testing.

### Atomic Assignment

Redis Lua scripting was chosen because Redis executes Lua scripts atomically, eliminating race conditions without requiring distributed locks.

---

## Future Improvements

* Replace `setTimeout()` with **BullMQ** for durable delayed jobs.
* WebSocket-based real-time driver notifications.
* Support multiple retry rounds with progressively increasing search radius.
* Track driver availability (AVAILABLE/BUSY).
* Persist notification history.
* Add authentication and authorization.
* Add unit and integration tests.
* Deploy using Kubernetes or a cloud platform.

---

## Repository Structure

```text
src/
 ├── drivers/
 ├── rides/
 ├── redis/
 ├── database/
 └── app.module.ts

scripts/
 ├── seed-drivers.ts
 ├── update-driver-locations.ts
 ├── create-test-ride.ts
 ├── concurrency-test.ts

docker-compose.yml
```

---

## Screenshots

### Start the container with the PostgreSQL and Redis instance
<img width="917" height="346" alt="image" src="https://github.com/user-attachments/assets/8c4ffe6e-728b-4cce-8e15-81a86f65fa79" />

### Start the NestJS App
<img width="632" height="128" alt="image" src="https://github.com/user-attachments/assets/164718f5-32ad-43e4-805b-2a7ab9b80f94" />
<img width="927" height="990" alt="image" src="https://github.com/user-attachments/assets/60ac1bc6-0b6d-4485-8379-13fc9d7c248d" />

### Run the automation scripts for data ingestion and testing
- Run the helper scripts for quickly generating test data.
```bash
# Create sample drivers
npm run seed

# Update all driver locations
npm run locations

# Create a ride
npm run ride

# Simulate concurrent driver acceptance
npm run concurrency
```
- Create Drivers
- <img width="672" height="257" alt="image" src="https://github.com/user-attachments/assets/133b20e1-c67f-4fb9-a8e8-c8b72b8ce154" />
- Update Locations
- <img width="601" height="262" alt="image" src="https://github.com/user-attachments/assets/50063c19-859c-4a75-aa85-74abc0e24ab9" />
- Book a ride
- <img width="566" height="205" alt="image" src="https://github.com/user-attachments/assets/26fa843e-2909-4748-9ff5-53d92f69dcd6" />
- Run the concurrency test
  - Booking failed because no rides were accepted with the time limit causing a timeout - Expected Behaviour
  - <img width="931" height="400" alt="image" src="https://github.com/user-attachments/assets/f9e8be08-7901-474a-9e4e-c631d3842c2b" />
  - Booking successful
  - <img width="1057" height="587" alt="image" src="https://github.com/user-attachments/assets/2abb9241-add9-4eea-902a-fc5e1f49d9ad" />
- Further tests can also be performed manually using tools such as. Postman 

### Stop the Services

```bash
docker compose down
```


---

## Author

Rohan Amin
