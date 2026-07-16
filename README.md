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
* Add WebSocket-based real-time driver notifications.
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
 └── concurrency-test.ts

docker-compose.yml
```

---

## Author

Rohan Amin
