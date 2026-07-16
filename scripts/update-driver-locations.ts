// scripts/update-driver-locations.ts

import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function main() {
  const { data: drivers } = await axios.get(
    `${BASE_URL}/drivers`,
  );

  for (const driver of drivers) {
    await axios.post(
      `${BASE_URL}/drivers/location`,
      {
        driverId: driver.id,
        latitude: 12.9716,
        longitude: 77.5946,
      },
    );

    console.log(
      `Updated ${driver.name}`,
    );
  }
}

main();