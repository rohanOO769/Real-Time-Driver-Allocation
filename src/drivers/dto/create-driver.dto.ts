// src/drivers/dto/create-driver.dto.ts

import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDriverDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}