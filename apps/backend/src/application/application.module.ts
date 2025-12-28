import { Module } from '@nestjs/common';
import { DatabaseModule } from '../infrastructure/database/database.module';
import { RedisModule } from '../infrastructure/redis/redis.module';
import {
  CreateVehicleUseCase,
  GetVehicleUseCase,
  GetVehiclesUseCase,
  EnableVehicleUseCase,
  GetVehiclePositionUseCase,
} from './use-cases/vehicle';
import { VehicleRepository } from '../infrastructure/database/repositories/vehicle.repository';
import { RedisVehiclePositionRepository } from '../infrastructure/redis/repositories/redis-vehicle-position.repository';
import { RedisVehicleStateRepository } from '../infrastructure/redis/repositories/redis-vehicle-state.repository';
import { VehicleSyncService } from '../infrastructure/redis/services/vehicle-sync.service';

@Module({
  imports: [DatabaseModule, RedisModule],
  providers: [
    VehicleRepository,
    RedisVehiclePositionRepository,
    RedisVehicleStateRepository,
    VehicleSyncService,
    CreateVehicleUseCase,
    GetVehicleUseCase,
    GetVehiclesUseCase,
    EnableVehicleUseCase,
    GetVehiclePositionUseCase,
  ],
  exports: [
    CreateVehicleUseCase,
    GetVehicleUseCase,
    GetVehiclesUseCase,
    EnableVehicleUseCase,
    GetVehiclePositionUseCase,
    VehicleRepository,
    RedisVehicleStateRepository,
  ],
})
export class ApplicationModule {}
