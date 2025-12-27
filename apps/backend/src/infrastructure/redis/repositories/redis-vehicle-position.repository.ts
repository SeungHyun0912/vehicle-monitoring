import { Injectable, Inject, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from '../redis.module';
import { RedisKeySchema, RedisPositionData } from '../redis-key.schema';
import { VehiclePosition } from '../../../domain/value-objects';

@Injectable()
export class RedisVehiclePositionRepository {
  private readonly logger = new Logger(RedisVehiclePositionRepository.name);

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redisClient: Redis,
  ) {}

  async getPosition(vehicleId: string): Promise<VehiclePosition | null> {
    try {
      const key = RedisKeySchema.vehiclePosition(vehicleId);
      const data = await this.redisClient.get(key);

      if (!data) {
        return null;
      }

      const parsed: RedisPositionData = JSON.parse(data);
      return this.mapToVehiclePosition(parsed);
    } catch (error) {
      this.logger.error(
        `Failed to get position for vehicle ${vehicleId}`,
        error,
      );
      throw error;
    }
  }

  async setPosition(
    vehicleId: string,
    position: VehiclePosition,
  ): Promise<void> {
    try {
      const key = RedisKeySchema.vehiclePosition(vehicleId);
      const data: RedisPositionData = {
        x: position.x,
        y: position.y,
        z: position.z,
        qx: position.rotation?.x || 0,
        qy: position.rotation?.y || 0,
        qz: position.rotation?.z || 0,
        qw: position.rotation?.w || 1,
        heading: position.heading,
        timestamp: position.timestamp.getTime(),
        mapId: position.mapId,
      };

      await this.redisClient.set(key, JSON.stringify(data));
      await this.redisClient.set(
        RedisKeySchema.vehicleLastUpdate(vehicleId),
        Date.now().toString(),
      );

      await this.redisClient.sadd(
        RedisKeySchema.VEHICLES_ACTIVE_SET,
        vehicleId,
      );
    } catch (error) {
      this.logger.error(
        `Failed to set position for vehicle ${vehicleId}`,
        error,
      );
      throw error;
    }
  }

  async getPositions(
    vehicleIds: string[],
  ): Promise<Map<string, VehiclePosition>> {
    const positions = new Map<string, VehiclePosition>();

    try {
      const pipeline = this.redisClient.pipeline();

      for (const vehicleId of vehicleIds) {
        pipeline.get(RedisKeySchema.vehiclePosition(vehicleId));
      }

      const results = await pipeline.exec();

      if (!results) {
        return positions;
      }

      vehicleIds.forEach((vehicleId, index) => {
        const [err, data] = results[index];
        if (!err && data) {
          try {
            const parsed: RedisPositionData = JSON.parse(data as string);
            const position = this.mapToVehiclePosition(parsed);
            positions.set(vehicleId, position);
          } catch (parseError) {
            this.logger.warn(
              `Failed to parse position for vehicle ${vehicleId}`,
              parseError,
            );
          }
        }
      });

      return positions;
    } catch (error) {
      this.logger.error('Failed to get multiple positions', error);
      throw error;
    }
  }

  async getAllActivePositions(): Promise<Map<string, VehiclePosition>> {
    try {
      const activeVehicleIds = await this.redisClient.smembers(
        RedisKeySchema.VEHICLES_ACTIVE_SET,
      );
      return this.getPositions(activeVehicleIds);
    } catch (error) {
      this.logger.error('Failed to get all active positions', error);
      throw error;
    }
  }

  async removePosition(vehicleId: string): Promise<void> {
    try {
      await this.redisClient.del(RedisKeySchema.vehiclePosition(vehicleId));
      await this.redisClient.del(
        RedisKeySchema.vehicleLastUpdate(vehicleId),
      );
      await this.redisClient.srem(
        RedisKeySchema.VEHICLES_ACTIVE_SET,
        vehicleId,
      );
    } catch (error) {
      this.logger.error(
        `Failed to remove position for vehicle ${vehicleId}`,
        error,
      );
      throw error;
    }
  }

  async getActiveVehicleIds(): Promise<string[]> {
    try {
      return await this.redisClient.smembers(
        RedisKeySchema.VEHICLES_ACTIVE_SET,
      );
    } catch (error) {
      this.logger.error('Failed to get active vehicle IDs', error);
      throw error;
    }
  }

  private mapToVehiclePosition(data: RedisPositionData): VehiclePosition {
    return new VehiclePosition(
      data.x,
      data.y,
      data.z,
      data.heading,
      new Date(data.timestamp),
      data.mapId,
      {
        x: data.qx,
        y: data.qy,
        z: data.qz,
        w: data.qw,
      },
    );
  }
}
