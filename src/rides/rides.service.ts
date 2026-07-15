// src/rides/rides.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Ride, RideStatus } from './entities/ride.entity';
import { CreateRideDto } from './dto/create-ride.dto';

@Injectable()
export class RidesService {
  constructor(
    @InjectRepository(Ride)
    private readonly rideRepository: Repository<Ride>,
  ) {}

  async create(dto: CreateRideDto) {
    const ride = this.rideRepository.create({
      ...dto,
      status: RideStatus.SEARCHING,
      assignedDriverId: null,
    });

    return this.rideRepository.save(ride);
  }

  async findAll() {
    return this.rideRepository.find();
  }
}