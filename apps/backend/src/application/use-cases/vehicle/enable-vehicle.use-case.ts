import { Injectable } from '@nestjs/common';
import { VehicleRepository } from '../../../infrastructure/database/repositories/vehicle.repository';
import { Vehicle } from '../../../domain/entities/vehicle.entity';
import { VehicleSyncService } from '../../../infrastructure/redis/services/vehicle-sync.service';

@Injectable()
export class EnableVehicleUseCase {
  constructor(
    private readonly vehicleRepository: VehicleRepository,
    private readonly syncService: VehicleSyncService,
  ) {}

  async execute(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.enable(id);

    // Start syncing with Redis when enabled
    // Note: Actual Redis sync would start when vehicle starts sending data

    return vehicle;
  }
}
