import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from '../config/database.config';
import { VehicleEntity, AMREntity, AGVEntity, OHTEntity } from './entities';
import { VehicleRepository } from './repositories/vehicle.repository';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(databaseConfig)],
      useFactory: (configService: ConfigService) => {
        const config = configService.get('database');
        if (!config) {
          throw new Error('Database configuration not found');
        }
        return config;
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([VehicleEntity, AMREntity, AGVEntity, OHTEntity]),
  ],
  providers: [VehicleRepository],
  exports: [VehicleRepository, TypeOrmModule],
})
export class DatabaseModule {}
