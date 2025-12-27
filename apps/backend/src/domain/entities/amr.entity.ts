import { Vehicle } from './vehicle.entity';
import {
  VehicleType,
  Manufacturer,
  VehicleSpecification,
} from '../value-objects';

export interface ObstacleAvoidanceConfig {
  enabled: boolean;
  minDistance: number;
  detectionAngle: number;
  avoidanceStrategy: 'STOP' | 'REROUTE' | 'SLOW_DOWN';
}

export class AMR extends Vehicle {
  lidarEnabled: boolean;
  cameraEnabled: boolean;
  ultrasonicEnabled: boolean;
  autonomyLevel: number;
  mapId?: string;
  obstacleAvoidanceConfig: ObstacleAvoidanceConfig;

  constructor(
    id: string,
    name: string,
    manufacturer: Manufacturer,
    specification: VehicleSpecification,
    lidarEnabled: boolean,
    cameraEnabled: boolean,
    ultrasonicEnabled: boolean,
    autonomyLevel: number,
    obstacleAvoidanceConfig: ObstacleAvoidanceConfig,
    model?: string,
    mapId?: string,
  ) {
    super(id, name, VehicleType.AMR, manufacturer, specification, model);
    this.lidarEnabled = lidarEnabled;
    this.cameraEnabled = cameraEnabled;
    this.ultrasonicEnabled = ultrasonicEnabled;
    this.autonomyLevel = autonomyLevel;
    this.mapId = mapId;
    this.obstacleAvoidanceConfig = obstacleAvoidanceConfig;

    if (autonomyLevel < 0 || autonomyLevel > 5) {
      throw new Error('Autonomy level must be between 0 and 5');
    }
  }

  setMap(mapId: string): void {
    this.mapId = mapId;
    this.updatedAt = new Date();
  }

  updateObstacleAvoidanceConfig(config: Partial<ObstacleAvoidanceConfig>): void {
    this.obstacleAvoidanceConfig = {
      ...this.obstacleAvoidanceConfig,
      ...config,
    };
    this.updatedAt = new Date();
  }

  getTypeSpecificInfo(): Record<string, any> {
    return {
      lidarEnabled: this.lidarEnabled,
      cameraEnabled: this.cameraEnabled,
      ultrasonicEnabled: this.ultrasonicEnabled,
      autonomyLevel: this.autonomyLevel,
      mapId: this.mapId,
      obstacleAvoidanceConfig: this.obstacleAvoidanceConfig,
    };
  }
}
