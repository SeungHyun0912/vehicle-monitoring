import { BaseEntity } from './base.entity';
import {
  VehicleType,
  VehicleStatus,
  Manufacturer,
  VehicleSpecification,
} from '../value-objects';

export abstract class Vehicle extends BaseEntity {
  name: string;
  type: VehicleType;
  manufacturer: Manufacturer;
  model?: string;
  status: VehicleStatus;
  isEnabled: boolean;
  specification: VehicleSpecification;
  deletedAt?: Date;

  constructor(
    id: string,
    name: string,
    type: VehicleType,
    manufacturer: Manufacturer,
    specification: VehicleSpecification,
    model?: string,
  ) {
    super(id);
    this.name = name;
    this.type = type;
    this.manufacturer = manufacturer;
    this.specification = specification;
    this.model = model;
    this.status = VehicleStatus.IDLE;
    this.isEnabled = false;
  }

  enable(): void {
    this.isEnabled = true;
    this.updatedAt = new Date();
  }

  disable(): void {
    this.isEnabled = false;
    this.updatedAt = new Date();
  }

  updateStatus(status: VehicleStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  softDelete(): void {
    this.deletedAt = new Date();
    this.isEnabled = false;
    this.updatedAt = new Date();
  }

  isDeleted(): boolean {
    return this.deletedAt !== undefined && this.deletedAt !== null;
  }

  abstract getTypeSpecificInfo(): Record<string, any>;
}
