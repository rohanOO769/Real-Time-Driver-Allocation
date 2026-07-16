// scripts/concurrency-test.ts

import axios from 'axios';
import fs from 'fs';

const BASE_URL = 'http://localhost:3000';

async function main() {
  const { rideId } = JSON.parse(
    fs.readFileSync(
      'scripts/test-data.json',
      'utf8',
    ),
  );

  const { data: drivers } =
    await axios.get(
      `${BASE_URL}/drivers`,
    );

  console.log(
    'Sending concurrent requests...\n',
  );

  const results = await Promise.all(
    drivers.map((driver: any) =>
      accept(rideId, driver.id),
    ),
  );

  console.table(
    results.map((r) => ({
      Driver: r.driverId.substring(0, 8),
      Success: r.success,
      Status: r.status,
      Message: r.success
        ? 'ASSIGNED'
        : r.data?.message,
    })),
  );
}

async function accept(
  rideId: string,
  driverId: string,
) {
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

main();