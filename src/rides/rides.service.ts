// src/rides/rides.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Ride, RideStatus } from './entities/ride.entity';
import { CreateRideDto } from './dto/create-ride.dto';

import { DriversService } from 'src/drivers/drivers.service';

@Injectable()
export class RidesService {
  constructor(
    @InjectRepository(Ride)
    private readonly rideRepository: Repository<Ride>,

    private readonly driversService: DriversService,
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

    return {
      ride: savedRide,
      nearbyDrivers,
    };
  }

  async findAll() {
    return this.rideRepository.find();
  }
}