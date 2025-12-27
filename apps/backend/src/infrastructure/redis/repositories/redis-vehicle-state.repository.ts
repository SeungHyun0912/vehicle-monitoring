import { Injectable, Inject, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from '../redis.module';
import { RedisKeySchema, RedisStateData } from '../redis-key.schema';
import { VehicleRuntimeState } from '../../../domain/value-objects';

@Injectable()
export class RedisVehicleStateRepository {
  private readonly logger = new Logger(RedisVehicleStateRepository.name);

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redisClient: Redis,
  ) {}

  async getState(vehicleId: string): Promise<VehicleRuntimeState | null> {
    try {
      const key = RedisKeySchema.vehicleState(vehicleId);
      const data = await this.redisClient.get(key);

      if (!data) {
        return null;
      }

      const parsed: RedisStateData = JSON.parse(data);
      return this.mapToVehicleRuntimeState(parsed);
    } catch (error) {
      this.logger.error(`Failed to get state for vehicle ${vehicleId}`, error);
      throw error;
    }
  }

  async setState(
    vehicleId: string,
    state: VehicleRuntimeState,
  ): Promise<void> {
    try {
      const key = RedisKeySchema.vehicleState(vehicleId);
      const data: RedisStateData = {
        currentSpeed: state.currentSpeed,
        batteryLevel: state.batteryLevel,
        currentLoad: state.currentLoad,
        temperature: state.temperature,
        errorCodes: state.errorCodes,
        timestamp: state.lastUpdateTime.getTime(),
      };

      await this.redisClient.set(key, JSON.stringify(data));
      await this.redisClient.set(
        RedisKeySchema.vehicleLastUpdate(vehicleId),
        Date.now().toString(),
      );
    } catch (error) {
      this.logger.error(`Failed to set state for vehicle ${vehicleId}`, error);
      throw error;
    }
  }

  async getStates(
    vehicleIds: string[],
  ): Promise<Map<string, VehicleRuntimeState>> {
    const states = new Map<string, VehicleRuntimeState>();

    try {
      const pipeline = this.redisClient.pipeline();

      for (const vehicleId of vehicleIds) {
        pipeline.get(RedisKeySchema.vehicleState(vehicleId));
      }

      const results = await pipeline.exec();

      if (!results) {
        return states;
      }

      vehicleIds.forEach((vehicleId, index) => {
        const [err, data] = results[index];
        if (!err && data) {
          try {
            const parsed: RedisStateData = JSON.parse(data as string);
            const state = this.mapToVehicleRuntimeState(parsed);
            states.set(vehicleId, state);
          } catch (parseError) {
            this.logger.warn(
              `Failed to parse state for vehicle ${vehicleId}`,
              parseError,
            );
          }
        }
      });

      return states;
    } catch (error) {
      this.logger.error('Failed to get multiple states', error);
      throw error;
    }
  }

  async getAllActiveStates(): Promise<Map<string, VehicleRuntimeState>> {
    try {
      const activeVehicleIds = await this.redisClient.smembers(
        RedisKeySchema.VEHICLES_ACTIVE_SET,
      );
      return this.getStates(activeVehicleIds);
    } catch (error) {
      this.logger.error('Failed to get all active states', error);
      throw error;
    }
  }

  async removeState(vehicleId: string): Promise<void> {
    try {
      await this.redisClient.del(RedisKeySchema.vehicleState(vehicleId));
    } catch (error) {
      this.logger.error(
        `Failed to remove state for vehicle ${vehicleId}`,
        error,
      );
      throw error;
    }
  }

  async getLastUpdateTime(vehicleId: string): Promise<Date | null> {
    try {
      const timestamp = await this.redisClient.get(
        RedisKeySchema.vehicleLastUpdate(vehicleId),
      );
      return timestamp ? new Date(parseInt(timestamp, 10)) : null;
    } catch (error) {
      this.logger.error(
        `Failed to get last update time for vehicle ${vehicleId}`,
        error,
      );
      throw error;
    }
  }

  private mapToVehicleRuntimeState(data: RedisStateData): VehicleRuntimeState {
    return new VehicleRuntimeState(
      data.currentSpeed,
      data.batteryLevel,
      new Date(data.timestamp),
      data.currentLoad,
      data.temperature,
      data.errorCodes,
    );
  }
}
