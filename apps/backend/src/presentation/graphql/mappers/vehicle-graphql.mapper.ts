import { Vehicle } from '../../../domain/entities/vehicle.entity';
import { AMR } from '../../../domain/entities/amr.entity';
import { AGV } from '../../../domain/entities/agv.entity';
import { OHT } from '../../../domain/entities/oht.entity';
import { VehicleType } from '../../../domain/value-objects';
import { AMRType, AGVType, OHTType, VehicleSpecificationType } from '../types';

export class VehicleGraphQLMapper {
  static toGraphQL(vehicle: Vehicle): any {
    const base = {
      id: vehicle.id,
      name: vehicle.name,
      type: vehicle.type,
      manufacturer: vehicle.manufacturer.name,
      model: vehicle.model,
      status: vehicle.status,
      isEnabled: vehicle.isEnabled,
      specification: this.mapSpecification(vehicle),
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
      deletedAt: vehicle.deletedAt,
    };

    switch (vehicle.type) {
      case VehicleType.AMR:
        return this.mapAMR(vehicle as AMR, base);
      case VehicleType.AGV:
        return this.mapAGV(vehicle as AGV, base);
      case VehicleType.OHT:
        return this.mapOHT(vehicle as OHT, base);
      default:
        throw new Error(`Unknown vehicle type: ${vehicle.type}`);
    }
  }

  private static mapSpecification(vehicle: Vehicle): VehicleSpecificationType {
    return {
      maxSpeed: vehicle.specification.maxSpeed,
      maxLoad: vehicle.specification.maxLoad,
      batteryCapacity: vehicle.specification.batteryCapacity,
      dimensions: vehicle.specification.dimensions,
      weight: vehicle.specification.weight,
    };
  }

  private static mapAMR(amr: AMR, base: any): AMRType {
    return {
      ...base,
      lidarEnabled: amr.lidarEnabled,
      cameraEnabled: amr.cameraEnabled,
      ultrasonicEnabled: amr.ultrasonicEnabled,
      autonomyLevel: amr.autonomyLevel,
      mapId: amr.mapId,
      obstacleAvoidanceConfig: amr.obstacleAvoidanceConfig,
    };
  }

  private static mapAGV(agv: AGV, base: any): AGVType {
    return {
      ...base,
      guideType: agv.guideType,
      lineFollowingConfig: agv.lineFollowingConfig,
      loadType: agv.loadType,
      maxLoadWeight: agv.maxLoadWeight,
    };
  }

  private static mapOHT(oht: OHT, base: any): OHTType {
    return {
      ...base,
      railId: oht.railId,
      hoistStatus: oht.hoistStatus,
      railPosition: oht.railPosition,
      railSegments: oht.railSegments,
    };
  }
}
