// src/redis/redis.service.ts

import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService {
  private readonly client: Redis;

  constructor(config: ConfigService) {
    this.client = new Redis({
      host: config.get('REDIS_HOST'),
      port: config.get<number>('REDIS_PORT'),
    });

    this.client.on('connect', () => {
      console.log('✅ Redis connected');
    });

    this.client.on('ready', () => {
      console.log('✅ Redis ready');
    });

    this.client.on('error', (err) => {
      console.error('❌ Redis error:', err);
    });
  }

  getClient() {
    return this.client;
  }

  async tryAssignRide(
    rideId: string,
    driverId: string,
  ): Promise<number> {
    const key = `ride:${rideId}:assignment`;

    const script = `
      local current = redis.call('GET', KEYS[1])

      if current then
        if current == ARGV[1] then
          return 2
        else
          return 0
        end
      end

      redis.call('SET', KEYS[1], ARGV[1], 'EX', 120)

      return 1
    `;

    const result = await this.client.eval(
      script,
      1,
      key,
      driverId,
    );

    return Number(result);
  }
}