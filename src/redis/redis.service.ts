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
}