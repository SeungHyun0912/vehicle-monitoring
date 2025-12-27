import { Module } from '@nestjs/common';
import { VehiclePositionGateway } from './vehicle-position.gateway';
import { RedisWebSocketBridgeService } from './redis-websocket-bridge.service';
import { RedisModule } from '../../infrastructure/redis/redis.module';
import { RedisVehiclePositionRepository } from '../../infrastructure/redis/repositories/redis-vehicle-position.repository';
import { RedisVehicleStateRepository } from '../../infrastructure/redis/repositories/redis-vehicle-state.repository';
import { RedisPubSubService } from '../../infrastructure/redis/services/redis-pubsub.service';
import { VehicleSyncService } from '../../infrastructure/redis/services/vehicle-sync.service';

@Module({
  imports: [RedisModule],
  providers: [
    VehiclePositionGateway,
    RedisWebSocketBridgeService,
    RedisVehiclePositionRepository,
    RedisVehicleStateRepository,
    RedisPubSubService,
    VehicleSyncService,
  ],
  exports: [
    VehiclePositionGateway,
    RedisWebSocketBridgeService,
    VehicleSyncService,
  ],
})
export class WebSocketModule {}
