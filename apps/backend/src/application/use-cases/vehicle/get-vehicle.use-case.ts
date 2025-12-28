import { Injectable } from '@nestjs/common';
import { VehicleRepository } from '../../../infrastructure/database/repositories/vehicle.repository';
import { Vehicle } from '../../../domain/entities/vehicle.entity';

@Injectable()
export class GetVehicleUseCase {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  async execute(id: string): Promise<Vehicle | null> {
    return this.vehicleRepository.findById(id);
  }
}
