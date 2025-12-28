import { Injectable } from '@nestjs/common';
import { VehicleRepository } from '../../../infrastructure/database/repositories/vehicle.repository';
import { VehicleFilter } from '../../../domain/repositories/vehicle.repository.interface';
import { Vehicle } from '../../../domain/entities/vehicle.entity';

@Injectable()
export class GetVehiclesUseCase {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  async execute(filter?: VehicleFilter): Promise<Vehicle[]> {
    if (filter) {
      return this.vehicleRepository.findByFilter(filter);
    }
    return this.vehicleRepository.findAll();
  }
}
