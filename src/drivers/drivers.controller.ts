// src/drivers/drivers.controller.ts

import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post()
  create(@Body() dto: CreateDriverDto) {
    return this.driversService.create(dto);
  }

  @Get()
  findAll() {
    return this.driversService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.driversService.findOne(id);
  }

  @Post('location')
    updateLocation(
    @Body() dto: UpdateLocationDto,
    ) {
    return this.driversService.updateLocation(dto);
    }
}