// src/database/database.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',

        host: config.get('DB_HOST'),

        port: config.get<number>('DB_PORT'),

        username: config.get('DB_USER'),

        password: config.get('DB_PASSWORD'),

        database: config.get('DB_NAME'),

        autoLoadEntities: true,

        synchronize: true,
      }),
    }),
  ],
})
export class DatabaseModule {}