import { Injectable } from '@nestjs/common';
import { VehicleRepository } from '../../../infrastructure/database/repositories/vehicle.repository';
import { RedisVehiclePositionRepository } from '../../../infrastructure/redis/repositories/redis-vehicle-position.repository';
import { AMR } from '../../../domain/entities/amr.entity';
import { AGV } from '../../../domain/entities/agv.entity';
import { OHT } from '../../../domain/entities/oht.entity';
import { Vehicle } from '../../../domain/entities/vehicle.entity';
import { Manufacturer, VehicleSpecification, VehicleType } from '../../../domain/value-objects';
import { v4 as uuidv4 } from 'uuid';

export interface CreateVehicleDto {
  name: string;
  type: VehicleType;
  manufacturer: string;
  model?: string;
  specification: {
    maxSpeed: number;
    maxLoad: number;
    batteryCapacity: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    weight?: number;
  };
  amrSpecific?: {
    lidarEnabled: boolean;
    cameraEnabled: boolean;
    ultrasonicEnabled: boolean;
    autonomyLevel: number;
    mapId?: string;
    obstacleAvoidanceConfig: {
      enabled: boolean;
      minDistance: number;
      detectionAngle: number;
      avoidanceStrategy: 'STOP' | 'REROUTE' | 'SLOW_DOWN';
    };
  };
  agvSpecific?: {
    guideType: any;
    lineFollowingConfig: {
      sensitivity: number;
      maxDeviation: number;
      correctionSpeed: number;
    };
    loadType: string;
    maxLoadWeight: number;
  };
  ohtSpecific?: {
    railId: string;
    railSegments: Array<{
      id: string;
      startPosition: number;
      endPosition: number;
      name?: string;
    }>;
  };
}

@Injectable()
export class CreateVehicleUseCase {
  constructor(
    private readonly vehicleRepository: VehicleRepository,
    private readonly redisPositionRepository: RedisVehiclePositionRepository,
  ) {}

  async execute(dto: CreateVehicleDto): Promise<Vehicle> {
    const id = uuidv4();
    const manufacturer = new Manufacturer(dto.manufacturer);
    const specification = new VehicleSpecification(
      dto.specification.maxSpeed,
      dto.specification.maxLoad,
      dto.specification.batteryCapacity,
      dto.specification.dimensions,
      dto.specification.weight,
    );

    let vehicle: Vehicle;

    switch (dto.type) {
      case VehicleType.AMR:
        if (!dto.amrSpecific) {
          throw new Error('AMR specific data is required');
        }
        vehicle = new AMR(
          id,
          dto.name,
          manufacturer,
          specification,
          dto.amrSpecific.lidarEnabled,
          dto.amrSpecific.cameraEnabled,
          dto.amrSpecific.ultrasonicEnabled,
          dto.amrSpecific.autonomyLevel,
          dto.amrSpecific.obstacleAvoidanceConfig,
          dto.model,
          dto.amrSpecific.mapId,
        );
        break;

      case VehicleType.AGV:
        if (!dto.agvSpecific) {
          throw new Error('AGV specific data is required');
        }
        vehicle = new AGV(
          id,
          dto.name,
          manufacturer,
          specification,
          dto.agvSpecific.guideType,
          dto.agvSpecific.lineFollowingConfig,
          dto.agvSpecific.loadType,
          dto.agvSpecific.maxLoadWeight,
          dto.model,
        );
        break;

      case VehicleType.OHT:
        if (!dto.ohtSpecific) {
          throw new Error('OHT specific data is required');
        }
        vehicle = new OHT(
          id,
          dto.name,
          manufacturer,
          specification,
          dto.ohtSpecific.railId,
          dto.ohtSpecific.railSegments,
          dto.model,
        );
        break;

      default:
        throw new Error(`Unsupported vehicle type: ${dto.type}`);
    }

    const created = await this.vehicleRepository.create(vehicle);
    return created;
  }
}
