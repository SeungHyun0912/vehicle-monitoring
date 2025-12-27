import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RedisPubSubService } from '../../infrastructure/redis/services/redis-pubsub.service';
import { VehiclePositionGateway } from './vehicle-position.gateway';
import { VehicleSyncService } from '../../infrastructure/redis/services/vehicle-sync.service';

@Injectable()
export class RedisWebSocketBridgeService implements OnModuleInit {
  private readonly logger = new Logger(RedisWebSocketBridgeService.name);

  constructor(
    private readonly redisPubSub: RedisPubSubService,
    private readonly gateway: VehiclePositionGateway,
    private readonly syncService: VehicleSyncService,
  ) {}

  async onModuleInit() {
    this.initializeBridge();
  }

  private initializeBridge() {
    this.redisPubSub.getPositionUpdates$().subscribe({
      next: (update) => {
        this.handlePositionUpdate(update);
      },
      error: (error) => {
        this.logger.error('Error in position updates stream', error);
      },
    });

    this.redisPubSub.getStateUpdates$().subscribe({
      next: (update) => {
        this.handleStateUpdate(update);
      },
      error: (error) => {
        this.logger.error('Error in state updates stream', error);
      },
    });

    this.logger.log('Redis to WebSocket bridge initialized');
  }

  private handlePositionUpdate(update: any) {
    try {
      const { vehicleId, position, timestamp } = update;

      if (!vehicleId || !position) {
        this.logger.warn('Invalid position update received', update);
        return;
      }

      this.gateway.broadcastPositionUpdate(vehicleId, {
        position,
        timestamp,
      });

      this.logger.debug(`Position update broadcasted for vehicle ${vehicleId}`);
    } catch (error) {
      this.logger.error('Failed to handle position update', error);
    }
  }

  private handleStateUpdate(update: any) {
    try {
      const { vehicleId, state, timestamp } = update;

      if (!vehicleId || !state) {
        this.logger.warn('Invalid state update received', update);
        return;
      }

      this.gateway.broadcastStateChange(vehicleId, {
        state,
        timestamp,
      });

      if (state.errorCodes && state.errorCodes.length > 0) {
        this.gateway.broadcastVehicleError(vehicleId, {
          errorCodes: state.errorCodes,
          message: 'Vehicle has errors',
        });
      }

      this.logger.debug(`State update broadcasted for vehicle ${vehicleId}`);
    } catch (error) {
      this.logger.error('Failed to handle state update', error);
    }
  }

  async broadcastVehicleData(vehicleId: string) {
    try {
      const data = await this.syncService.syncVehicleData(vehicleId);

      if (data.position) {
        this.gateway.broadcastPositionUpdate(vehicleId, {
          position: data.position.toJSON(),
        });
      }

      if (data.state) {
        this.gateway.broadcastStateChange(vehicleId, {
          state: data.state.toJSON(),
        });
      }
    } catch (error) {
      this.logger.error(
        `Failed to broadcast vehicle data for ${vehicleId}`,
        error,
      );
    }
  }

  async broadcastAllVehiclesData() {
    try {
      const vehiclesData = await this.syncService.syncAllEnabledVehicles();

      for (const [vehicleId, data] of vehiclesData.entries()) {
        if (data.position) {
          this.gateway.broadcastPositionUpdate(vehicleId, {
            position: data.position.toJSON(),
          });
        }

        if (data.state) {
          this.gateway.broadcastStateChange(vehicleId, {
            state: data.state.toJSON(),
          });
        }
      }

      this.logger.log(`Broadcasted data for ${vehiclesData.size} vehicles`);
    } catch (error) {
      this.logger.error('Failed to broadcast all vehicles data', error);
    }
  }
}
