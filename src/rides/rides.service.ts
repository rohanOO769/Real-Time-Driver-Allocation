// src/rides/rides.service.ts

import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { AcceptRideDto } from './dto/accept-ride.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Ride, RideStatus } from './entities/ride.entity';
import { CreateRideDto } from './dto/create-ride.dto';

import { DriversService } from 'src/drivers/drivers.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RidesService {
  constructor(
    @InjectRepository(Ride)
    private readonly rideRepository: Repository<Ride>,

    private readonly driversService: DriversService,

    private readonly redisService: RedisService,
  ) {}

  async create(dto: CreateRideDto) {
    const ride = this.rideRepository.create({
      ...dto,
      status: RideStatus.SEARCHING,
      assignedDriverId: null,
    });

    const savedRide = await this.rideRepository.save(ride);

    const nearbyDrivers = await this.driversService.findNearbyDrivers(
      dto.pickupLatitude,
      dto.pickupLongitude,
    );

    const redis = this.redisService.getClient();

    if (nearbyDrivers.length > 0) {
      await redis.sadd(
        `ride:${savedRide.id}:notified`,
        ...nearbyDrivers.map(String),
      );
    }

    setTimeout(() => {
      this.retryRide(savedRide.id);
    }, 15000);

    return {
      ride: savedRide,
      nearbyDrivers,
    };
  }

  async findAll() {
    return this.rideRepository.find();
  }

  async acceptRide(
    rideId: string,
    dto: AcceptRideDto,
  ) {
    const ride = await this.rideRepository.findOneBy({
      id: rideId,
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    if (ride.status !== RideStatus.SEARCHING && ride.status !== RideStatus.RETRYING) {
      throw new BadRequestException(
        'Ride is no longer available',
      );
    }

    const redis = this.redisService.getClient();

    const notified = await redis.call(
      'SISMEMBER',
      `ride:${rideId}:notified`,
      dto.driverId,
    );

    if (Number(notified) !== 1) {
      throw new BadRequestException(
        'Driver was not notified',
      );
    }

    const result = await this.redisService.tryAssignRide(
      rideId,
      dto.driverId,
    );

    switch (result) {

      case 0:
        throw new BadRequestException(
          'Ride already assigned to another driver',
        );

      case 2:
        return ride;

      case 1:
        ride.assignedDriverId = dto.driverId;
        ride.status = RideStatus.ASSIGNED;

        await this.rideRepository.save(ride);

        await this.redisService.cleanupRideKeys(
          ride.id,
        );

        return ride;

      default:
        throw new BadRequestException(
          'Unexpected Redis response',
        );
    }
  }

  private async retryRide(
    rideId: string,
  ): Promise<void> {

    const ride = await this.rideRepository.findOneBy({
      id: rideId,
    });

    if (!ride) {
      return;
    }

    if (ride.status === RideStatus.ASSIGNED) {
      console.log(
        `Ride ${ride.id} already assigned`,
      );
      return;
    }

    const redis = this.redisService.getClient();

    const nearbyDrivers =
      await this.driversService.findNearbyDrivers(
        ride.pickupLatitude,
        ride.pickupLongitude,
        10, // retry radius
      );

    const alreadyNotified = await redis.smembers(
      `ride:${ride.id}:notified`,
    );

    const newDrivers = nearbyDrivers.filter(
      (driverId) => !alreadyNotified.includes(driverId),
    );

    if (newDrivers.length === 0) {

      ride.status = RideStatus.TIMEOUT;

      await this.rideRepository.save(ride);

      await this.redisService.cleanupRideKeys(
        ride.id,
      );

      console.log(
        `Ride ${ride.id} timed out`,
      );

      return;
    }

    await redis.sadd(
      `ride:${ride.id}:notified`,
      ...newDrivers,
    );

    ride.status = RideStatus.RETRYING;

    await this.rideRepository.save(ride);

    console.log(
      `Retrying ride ${ride.id}`,
    );

    console.log(
      'New drivers:',
      newDrivers,
    );
  }
}