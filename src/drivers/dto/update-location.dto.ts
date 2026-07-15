// src/drivers/dto/update-location.dto.ts

import { IsLatitude, IsLongitude, IsUUID } from 'class-validator';

export class UpdateLocationDto {
  @IsUUID()
  driverId: string;

  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;
}