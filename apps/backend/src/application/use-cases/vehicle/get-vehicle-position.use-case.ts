import { Injectable } from '@nestjs/common';
import { RedisVehiclePositionRepository } from '../../../infrastructure/redis/repositories/redis-vehicle-position.repository';
import { VehiclePosition } from '../../../domain/value-objects';

@Injectable()
export class GetVehiclePositionUseCase {
  constructor(
    private readonly positionRepository: RedisVehiclePositionRepository,
  ) {}

  async execute(vehicleId: string): Promise<VehiclePosition | null> {
    return this.positionRepository.getPosition(vehicleId);
  }
}
