// src/rides/rides.controller.ts

import { Body, Controller, Get, Post } from '@nestjs/common';

import { RidesService } from './rides.service';
import { CreateRideDto } from './dto/create-ride.dto';

@Controller('rides')
export class RidesController {
  constructor(private readonly ridesService: RidesService) {}

  @Post()
  create(@Body() dto: CreateRideDto) {
    return this.ridesService.create(dto);
  }

  @Get()
  findAll() {
    return this.ridesService.findAll();
  }
}