import { Vehicle } from './vehicle.entity';
import {
  VehicleType,
  Manufacturer,
  VehicleSpecification,
} from '../value-objects';

export enum HoistStatus {
  UP = 'UP',
  DOWN = 'DOWN',
  MOVING = 'MOVING',
}

export interface RailSegment {
  id: string;
  startPosition: number;
  endPosition: number;
  name?: string;
}

export class OHT extends Vehicle {
  railId: string;
  hoistStatus: HoistStatus;
  railPosition: number;
  railSegments: RailSegment[];

  constructor(
    id: string,
    name: string,
    manufacturer: Manufacturer,
    specification: VehicleSpecification,
    railId: string,
    railSegments: RailSegment[],
    model?: string,
  ) {
    super(id, name, VehicleType.OHT, manufacturer, specification, model);
    this.railId = railId;
    this.hoistStatus = HoistStatus.UP;
    this.railPosition = 0;
    this.railSegments = railSegments;

    if (!railSegments || railSegments.length === 0) {
      throw new Error('OHT must have at least one rail segment');
    }
  }

  updateHoistStatus(status: HoistStatus): void {
    this.hoistStatus = status;
    this.updatedAt = new Date();
  }

  updateRailPosition(position: number): void {
    const isValidPosition = this.railSegments.some(
      (segment) => position >= segment.startPosition && position <= segment.endPosition,
    );

    if (!isValidPosition) {
      throw new Error('Rail position is outside of valid rail segments');
    }

    this.railPosition = position;
    this.updatedAt = new Date();
  }

  getCurrentSegment(): RailSegment | null {
    return (
      this.railSegments.find(
        (segment) =>
          this.railPosition >= segment.startPosition &&
          this.railPosition <= segment.endPosition,
      ) || null
    );
  }

  getTypeSpecificInfo(): Record<string, any> {
    return {
      railId: this.railId,
      hoistStatus: this.hoistStatus,
      railPosition: this.railPosition,
      railSegments: this.railSegments,
      currentSegment: this.getCurrentSegment(),
    };
  }
}
