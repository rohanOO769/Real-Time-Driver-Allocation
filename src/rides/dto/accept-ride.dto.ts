// src/rides/dto/accept-ride.dto.ts

import { IsUUID } from 'class-validator';

export class AcceptRideDto {
  @IsUUID()
  driverId: string;
}