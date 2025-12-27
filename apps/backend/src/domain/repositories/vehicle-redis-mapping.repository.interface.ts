import { IBaseRepository } from './base.repository.interface';
import { VehicleRedisMapping } from '../entities/vehicle-redis-mapping.entity';

export interface IVehicleRedisMappingRepository
  extends IBaseRepository<VehicleRedisMapping> {
  findByVehicleId(vehicleId: string): Promise<VehicleRedisMapping | null>;
  findByRedisKey(redisKey: string): Promise<VehicleRedisMapping | null>;
  findHealthyMappings(): Promise<VehicleRedisMapping[]>;
  findStaleMappings(maxAgeMs: number): Promise<VehicleRedisMapping[]>;
}
