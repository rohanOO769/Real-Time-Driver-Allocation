// src/rides/rides.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Ride } from './entities/ride.entity';
import { RidesController } from './rides.controller';
import { RidesService } from './rides.service';

import { RedisModule } from '../redis/redis.module';
import { DriversModule } from '../drivers/drivers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ride]),
    RedisModule,
    DriversModule,
  ],
  controllers: [RidesController],
  providers: [RidesService],
  exports: [RidesService],
})
export class RidesModule {}