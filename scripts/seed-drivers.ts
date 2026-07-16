// scripts/seed-drivers.ts

import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function main() {
  for (let i = 1; i <= 4; i++) {
    const res = await axios.post(`${BASE_URL}/drivers`, {
      name: `Driver ${i}`,
    });

    console.log(
      `Created Driver ${i}: ${res.data.id}`,
    );
  }
}

main();