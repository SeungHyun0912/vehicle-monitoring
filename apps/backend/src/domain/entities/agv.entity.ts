import { Vehicle } from './vehicle.entity';
import {
  VehicleType,
  Manufacturer,
  VehicleSpecification,
} from '../value-objects';

export enum GuideType {
  MAGNETIC = 'MAGNETIC',
  LASER = 'LASER',
  WIRE = 'WIRE',
  VISION = 'VISION',
}

export interface LineFollowingConfig {
  sensitivity: number;
  maxDeviation: number;
  correctionSpeed: number;
}

export class AGV extends Vehicle {
  guideType: GuideType;
  lineFollowingConfig: LineFollowingConfig;
  loadType: string;
  maxLoadWeight: number;

  constructor(
    id: string,
    name: string,
    manufacturer: Manufacturer,
    specification: VehicleSpecification,
    guideType: GuideType,
    lineFollowingConfig: LineFollowingConfig,
    loadType: string,
    maxLoadWeight: number,
    model?: string,
  ) {
    super(id, name, VehicleType.AGV, manufacturer, specification, model);
    this.guideType = guideType;
    this.lineFollowingConfig = lineFollowingConfig;
    this.loadType = loadType;
    this.maxLoadWeight = maxLoadWeight;

    if (maxLoadWeight <= 0) {
      throw new Error('Max load weight must be greater than 0');
    }
  }

  updateLineFollowingConfig(config: Partial<LineFollowingConfig>): void {
    this.lineFollowingConfig = {
      ...this.lineFollowingConfig,
      ...config,
    };
    this.updatedAt = new Date();
  }

  getTypeSpecificInfo(): Record<string, any> {
    return {
      guideType: this.guideType,
      lineFollowingConfig: this.lineFollowingConfig,
      loadType: this.loadType,
      maxLoadWeight: this.maxLoadWeight,
    };
  }
}
