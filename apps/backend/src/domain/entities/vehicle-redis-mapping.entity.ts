import { BaseEntity } from './base.entity';

export enum SyncStatus {
  SYNCED = 'SYNCED',
  OUT_OF_SYNC = 'OUT_OF_SYNC',
  ERROR = 'ERROR',
}

export enum ConnectionStatus {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  TIMEOUT = 'TIMEOUT',
}

export class VehicleRedisMapping extends BaseEntity {
  vehicleId: string;
  redisKey: string;
  lastSyncTime: Date;
  syncStatus: SyncStatus;
  connectionStatus: ConnectionStatus;
  errorMessage?: string;

  constructor(vehicleId: string, redisKey: string) {
    super(`${vehicleId}-mapping`);
    this.vehicleId = vehicleId;
    this.redisKey = redisKey;
    this.lastSyncTime = new Date();
    this.syncStatus = SyncStatus.OUT_OF_SYNC;
    this.connectionStatus = ConnectionStatus.DISCONNECTED;
  }

  markSynced(): void {
    this.syncStatus = SyncStatus.SYNCED;
    this.lastSyncTime = new Date();
    this.connectionStatus = ConnectionStatus.CONNECTED;
    this.errorMessage = undefined;
    this.updatedAt = new Date();
  }

  markOutOfSync(): void {
    this.syncStatus = SyncStatus.OUT_OF_SYNC;
    this.updatedAt = new Date();
  }

  markError(errorMessage: string): void {
    this.syncStatus = SyncStatus.ERROR;
    this.connectionStatus = ConnectionStatus.DISCONNECTED;
    this.errorMessage = errorMessage;
    this.updatedAt = new Date();
  }

  markTimeout(): void {
    this.connectionStatus = ConnectionStatus.TIMEOUT;
    this.syncStatus = SyncStatus.OUT_OF_SYNC;
    this.updatedAt = new Date();
  }

  isHealthy(): boolean {
    return (
      this.syncStatus === SyncStatus.SYNCED &&
      this.connectionStatus === ConnectionStatus.CONNECTED &&
      !this.isSyncStale()
    );
  }

  isSyncStale(maxAgeMs: number = 10000): boolean {
    const now = new Date();
    return now.getTime() - this.lastSyncTime.getTime() > maxAgeMs;
  }

  getRedisPositionKey(): string {
    return `${this.redisKey}:position`;
  }

  getRedisStateKey(): string {
    return `${this.redisKey}:state`;
  }

  getRedisLastUpdateKey(): string {
    return `${this.redisKey}:last_update`;
  }
}
