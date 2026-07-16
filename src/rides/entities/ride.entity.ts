// src/rides/entities/ride.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum RideStatus {
  REQUESTED = 'REQUESTED',
  SEARCHING = 'SEARCHING',
  RETRYING = 'RETRYING',
  ASSIGNED = 'ASSIGNED',
  TIMEOUT = 'TIMEOUT',
}

@Entity('rides')
export class Ride {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  riderName: string;

  @Column('double precision')
  pickupLatitude: number;

  @Column('double precision')
  pickupLongitude: number;

  @Column({
    type: 'enum',
    enum: RideStatus,
    default: RideStatus.REQUESTED,
  })
  status: RideStatus;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  assignedDriverId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}