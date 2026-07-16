// scripts/concurrency-test.ts

import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

const rideId = '6efbf706-c34b-472e-ae38-f3e1d4475562';

const drivers = [
  'e56d87c9-3125-4b09-b9b0-9cf7acf01812',
  'f7c3586a-4356-4b5d-9bef-19daa5da6870',
  'd2b3c0c5-fc6c-4adf-b582-9c40ac4aae32',
  'e268d03d-0697-4160-978b-aa5bc4c433d8',
];

async function accept(driverId: string) {
  try {
    const response = await axios.post(
      `${BASE_URL}/rides/${rideId}/accept`,
      {
        driverId,
      },
    );

    return {
      driverId,
      success: true,
      status: response.status,
      data: response.data,
    };
  } catch (error: any) {
    return {
      driverId,
      success: false,
      status: error.response?.status,
      data: error.response?.data,
    };
  }
}

async function main() {
  console.log('Sending concurrent accept requests...\n');

  const results = await Promise.all(
    drivers.map((driver) => accept(driver)),
  );

  console.table(
    results.map((r) => ({
      Driver: r.driverId.substring(0, 8),
      Success: r.success,
      Status: r.status,
      Message:
        r.success
          ? 'ASSIGNED'
          : r.data?.message,
    })),
  );
}

main();