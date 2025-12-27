import { Injectable, Logger } from '@nestjs/common';
import { RedisVehiclePositionRepository } from '../repositories/redis-vehicle-position.repository';
import { RedisVehicleStateRepository } from '../repositories/redis-vehicle-state.repository';
import { VehiclePosition, VehicleRuntimeState } from '../../../domain/value-objects';

export interface VehicleData {
  vehicleId: string;
  position?: VehiclePosition;
  state?: VehicleRuntimeState;
}

@Injectable()
export class VehicleSyncService {
  private readonly logger = new Logger(VehicleSyncService.name);
  private syncInterval?: NodeJS.Timeout;
  private isRunning = false;

  constructor(
    private readonly positionRepository: RedisVehiclePositionRepository,
    private readonly stateRepository: RedisVehicleStateRepository,
  ) {}

  async syncVehiclePosition(vehicleId: string): Promise<VehiclePosition | null> {
    try {
      const position = await this.positionRepository.getPosition(vehicleId);

      if (position && position.isStale()) {
        this.logger.warn(`Position data for vehicle ${vehicleId} is stale`);
      }

      return position;
    } catch (error) {
      this.logger.error(
        `Failed to sync position for vehicle ${vehicleId}`,
        error,
      );
      throw error;
    }
  }

  async syncVehicleState(vehicleId: string): Promise<VehicleRuntimeState | null> {
    try {
      const state = await this.stateRepository.getState(vehicleId);

      if (state && state.isStale()) {
        this.logger.warn(`State data for vehicle ${vehicleId} is stale`);
      }

      return state;
    } catch (error) {
      this.logger.error(
        `Failed to sync state for vehicle ${vehicleId}`,
        error,
      );
      throw error;
    }
  }

  async syncVehicleData(vehicleId: string): Promise<VehicleData> {
    try {
      const [position, state] = await Promise.all([
        this.syncVehiclePosition(vehicleId),
        this.syncVehicleState(vehicleId),
      ]);

      return {
        vehicleId,
        position: position || undefined,
        state: state || undefined,
      };
    } catch (error) {
      this.logger.error(
        `Failed to sync data for vehicle ${vehicleId}`,
        error,
      );
      throw error;
    }
  }

  async syncAllEnabledVehicles(): Promise<Map<string, VehicleData>> {
    try {
      const activeVehicleIds = await this.positionRepository.getActiveVehicleIds();
      const vehicleDataMap = new Map<string, VehicleData>();

      const syncPromises = activeVehicleIds.map((vehicleId) =>
        this.syncVehicleData(vehicleId),
      );

      const results = await Promise.allSettled(syncPromises);

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          vehicleDataMap.set(activeVehicleIds[index], result.value);
        } else {
          this.logger.error(
            `Failed to sync vehicle ${activeVehicleIds[index]}`,
            result.reason,
          );
        }
      });

      this.logger.log(
        `Synced ${vehicleDataMap.size} out of ${activeVehicleIds.length} active vehicles`,
      );

      return vehicleDataMap;
    } catch (error) {
      this.logger.error('Failed to sync all enabled vehicles', error);
      throw error;
    }
  }

  startAutoSync(intervalMs: number = 1000): void {
    if (this.isRunning) {
      this.logger.warn('Auto sync is already running');
      return;
    }

    this.isRunning = true;
    this.logger.log(`Starting auto sync with interval ${intervalMs}ms`);

    this.syncInterval = setInterval(async () => {
      try {
        await this.syncAllEnabledVehicles();
      } catch (error) {
        this.logger.error('Auto sync failed', error);
      }
    }, intervalMs);
  }

  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
      this.isRunning = false;
      this.logger.log('Auto sync stopped');
    }
  }

  async validateVehicleData(vehicleId: string): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    try {
      const [position, state] = await Promise.all([
        this.positionRepository.getPosition(vehicleId),
        this.stateRepository.getState(vehicleId),
      ]);

      if (!position) {
        errors.push('Position data not found');
      } else if (position.isStale()) {
        errors.push('Position data is stale');
      }

      if (!state) {
        errors.push('State data not found');
      } else {
        if (state.isStale()) {
          errors.push('State data is stale');
        }
        if (!state.isHealthy()) {
          errors.push('Vehicle is not healthy');
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      this.logger.error(
        `Failed to validate vehicle data for ${vehicleId}`,
        error,
      );
      return {
        isValid: false,
        errors: ['Validation failed due to error'],
      };
    }
  }

  isAutoSyncRunning(): boolean {
    return this.isRunning;
  }
}
