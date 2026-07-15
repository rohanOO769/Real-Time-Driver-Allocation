// src/rides/rides.controller.ts

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';

import { RidesService } from './rides.service';
import { CreateRideDto } from './dto/create-ride.dto';
import { AcceptRideDto } from './dto/accept-ride.dto';

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

  @Post(':rideId/accept')
  acceptRide(
    @Param('rideId') rideId: string,
    @Body() dto: AcceptRideDto,
  ) {
    return this.ridesService.acceptRide(rideId, dto);
  }
}