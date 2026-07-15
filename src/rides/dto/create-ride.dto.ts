// src/rides/dto/create-ride.dto.ts

import {
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateRideDto {
  @IsString()
  @IsNotEmpty()
  riderName: string;

  @IsLatitude()
  pickupLatitude: number;

  @IsLongitude()
  pickupLongitude: number;
}