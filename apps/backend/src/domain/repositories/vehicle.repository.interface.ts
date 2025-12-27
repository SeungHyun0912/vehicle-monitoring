import { IBaseRepository } from './base.repository.interface';
import { Vehicle } from '../entities/vehicle.entity';
import { VehicleType } from '../value-objects';

export interface VehicleFilter {
  type?: VehicleType;
  status?: string;
  isEnabled?: boolean;
  manufacturerName?: string;
}

export interface IVehicleRepository extends IBaseRepository<Vehicle> {
  findByType(type: VehicleType): Promise<Vehicle[]>;
  findEnabledVehicles(): Promise<Vehicle[]>;
  findByFilter(filter: VehicleFilter): Promise<Vehicle[]>;
  enable(id: string): Promise<Vehicle>;
  disable(id: string): Promise<Vehicle>;
  softDelete(id: string): Promise<void>;
  findByIdIncludingDeleted(id: string): Promise<Vehicle | null>;
}
