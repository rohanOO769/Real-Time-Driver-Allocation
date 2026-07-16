// src/app.controller.ts

import { Controller, Get } from '@nestjs/common';
import { RedisService } from './redis/redis.service';

@Controller()
export class AppController {
  constructor(private readonly redis: RedisService) {}

  @Get()
  async hello() {
    const client = this.redis.getClient();

    await client.set('test', 'working');

    return client.get('test');
  }
}