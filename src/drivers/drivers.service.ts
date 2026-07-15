// src/drivers/drivers.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Driver } from './entities/driver.entity';
import { CreateDriverDto } from './dto/create-driver.dto';
import { RedisService } from '../redis/redis.service';

import { NotFoundException } from '@nestjs/common';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,

    private readonly redisService: RedisService,
    ) {}

  async create(createDriverDto: CreateDriverDto) {
    const driver = this.driverRepository.create(createDriverDto);

    return this.driverRepository.save(driver);
  }

  async findAll() {
    return this.driverRepository.find();
  }

  async findOne(id: string) {
    return this.driverRepository.findOneBy({ id });
  }

  async updateLocation(dto: UpdateLocationDto) {
    const driver = await this.driverRepository.findOneBy({
        id: dto.driverId,
    });

    if (!driver) {
        throw new NotFoundException('Driver not found');
    }

    const redis = this.redisService.getClient();

    await redis.call(
        'GEOADD',
        'drivers:geo',
        dto.longitude,
        dto.latitude,
        dto.driverId,
    );

    return {
        message: 'Location updated successfully',
    };
  }

  async findNearbyDrivers(
    latitude: number,
    longitude: number,
    radiusKm = 5,
    limit = 5,
  ): Promise<string[]> {

    const redis = this.redisService.getClient();

    const nearbyDrivers = await redis.call(
      'GEOSEARCH',
      'drivers:geo',
      'FROMLONLAT',
      longitude,
      latitude,
      'BYRADIUS',
      radiusKm,
      'km',
      'ASC',
      'COUNT',
      limit,
    );

    return nearbyDrivers as string[];
  }
}