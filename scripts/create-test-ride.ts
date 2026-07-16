// scripts/create-test-ride.ts

import axios from 'axios';
import fs from 'fs';

const BASE_URL = 'http://localhost:3000';

async function main() {
  const res = await axios.post(
    `${BASE_URL}/rides`,
    {
      riderName: 'Concurrency Test',
      pickupLatitude: 12.9716,
      pickupLongitude: 77.5946,
    },
  );

  const rideId = res.data.ride.id;

  fs.writeFileSync(
    'scripts/test-data.json',
    JSON.stringify({ rideId }, null, 2),
  );

  console.log('Ride ID:', rideId);
}

main();