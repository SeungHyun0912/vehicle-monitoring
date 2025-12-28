import { Vehicle } from '../../../domain/entities/vehicle.entity';
import { AMR } from '../../../domain/entities/amr.entity';
import { AGV } from '../../../domain/entities/agv.entity';
import { OHT } from '../../../domain/entities/oht.entity';
import { VehicleEntity } from '../entities/vehicle.entity';
import { AMREntity } from '../entities/amr.entity';
import { AGVEntity } from '../entities/agv.entity';
import { OHTEntity } from '../entities/oht.entity';
import { Manufacturer, VehicleSpecification, VehicleType } from '../../../domain/value-objects';

export class VehicleMapper {
  static toDomain(entity: VehicleEntity): Vehicle {
    const manufacturer = new Manufacturer(entity.manufacturer);
    const specification = new VehicleSpecification(
      entity.specification.maxSpeed,
      entity.specification.maxLoad,
      entity.specification.batteryCapacity,
      entity.specification.dimensions,
      entity.specification.weight,
    );

    let vehicle: Vehicle;

    switch (entity.type) {
      case VehicleType.AMR: {
        const amrEntity = entity as AMREntity;
        vehicle = new AMR(
          amrEntity.id,
          amrEntity.name,
          manufacturer,
          specification,
          amrEntity.lidarEnabled,
          amrEntity.cameraEnabled,
          amrEntity.ultrasonicEnabled,
          amrEntity.autonomyLevel,
          amrEntity.obstacleAvoidanceConfig as any,
          amrEntity.model,
          amrEntity.mapId,
        );
        break;
      }
      case VehicleType.AGV: {
        const agvEntity = entity as AGVEntity;
        vehicle = new AGV(
          agvEntity.id,
          agvEntity.name,
          manufacturer,
          specification,
          agvEntity.guideType,
          agvEntity.lineFollowingConfig,
          agvEntity.loadType,
          agvEntity.maxLoadWeight,
          agvEntity.model,
        );
        break;
      }
      case VehicleType.OHT: {
        const ohtEntity = entity as OHTEntity;
        vehicle = new OHT(
          ohtEntity.id,
          ohtEntity.name,
          manufacturer,
          specification,
          ohtEntity.railId,
          ohtEntity.railSegments,
          ohtEntity.model,
        );
        (vehicle as OHT).hoistStatus = ohtEntity.hoistStatus;
        (vehicle as OHT).railPosition = ohtEntity.railPosition;
        break;
      }
      default:
        throw new Error(`Unknown vehicle type: ${entity.type}`);
    }

    vehicle.status = entity.status;
    vehicle.isEnabled = entity.isEnabled;
    vehicle.createdAt = entity.createdAt;
    vehicle.updatedAt = entity.updatedAt;
    vehicle.deletedAt = entity.deletedAt;

    return vehicle;
  }

  static toEntity(domain: Vehicle): VehicleEntity {
    const baseData = {
      id: domain.id,
      name: domain.name,
      type: domain.type,
      manufacturer: domain.manufacturer.name,
      model: domain.model,
      status: domain.status,
      isEnabled: domain.isEnabled,
      specification: {
        maxSpeed: domain.specification.maxSpeed,
        maxLoad: domain.specification.maxLoad,
        batteryCapacity: domain.specification.batteryCapacity,
        dimensions: domain.specification.dimensions,
        weight: domain.specification.weight,
      },
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
      deletedAt: domain.deletedAt,
    };

    switch (domain.type) {
      case VehicleType.AMR: {
        const amr = domain as AMR;
        const entity = new AMREntity();
        Object.assign(entity, baseData);
        entity.lidarEnabled = amr.lidarEnabled;
        entity.cameraEnabled = amr.cameraEnabled;
        entity.ultrasonicEnabled = amr.ultrasonicEnabled;
        entity.autonomyLevel = amr.autonomyLevel;
        entity.mapId = amr.mapId;
        entity.obstacleAvoidanceConfig = amr.obstacleAvoidanceConfig;
        return entity;
      }
      case VehicleType.AGV: {
        const agv = domain as AGV;
        const entity = new AGVEntity();
        Object.assign(entity, baseData);
        entity.guideType = agv.guideType;
        entity.lineFollowingConfig = agv.lineFollowingConfig;
        entity.loadType = agv.loadType;
        entity.maxLoadWeight = agv.maxLoadWeight;
        return entity;
      }
      case VehicleType.OHT: {
        const oht = domain as OHT;
        const entity = new OHTEntity();
        Object.assign(entity, baseData);
        entity.railId = oht.railId;
        entity.hoistStatus = oht.hoistStatus;
        entity.railPosition = oht.railPosition;
        entity.railSegments = oht.railSegments;
        return entity;
      }
      default:
        throw new Error(`Unknown vehicle type: ${domain.type}`);
    }
  }
}
