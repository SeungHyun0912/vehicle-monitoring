import { SimplifiedCreateVehicleInput, SimplifiedUpdateVehicleInput } from '../inputs';
import { VehicleType } from '../../../domain/value-objects';
import { GuideType } from '../../../domain/entities/agv.entity';

/**
 * Maps simplified frontend inputs to the complex backend structure.
 * This allows the frontend to send simple, flat data structures while
 * the backend maintains its rich domain model.
 */
export class SimplifiedVehicleMapper {
  /**
   * Converts SimplifiedCreateVehicleInput to CreateVehicleDto
   * Provides sensible defaults for required fields that the frontend doesn't send.
   */
  static toCreateDto(input: SimplifiedCreateVehicleInput): any {
    const baseDto: any = {
      name: input.name,
      type: input.type,
      manufacturer: 'Default Manufacturer', // Default value
      model: `${input.type}-Model`,
      specification: {
        maxSpeed: input.maxSpeed || 2.0,
        maxLoad: input.loadCapacity || 500,
        batteryCapacity: input.batteryCapacity || 100,
        dimensions: {
          length: 1.5,
          width: 0.8,
          height: 1.2,
        },
        weight: 200,
      },
    };

    // Add type-specific configuration based on vehicle type
    switch (input.type) {
      case VehicleType.AMR:
        baseDto.amrSpecific = {
          lidarEnabled: true,
          cameraEnabled: true,
          ultrasonicEnabled: true,
          autonomyLevel: 3,
          mapId: 'default-map',
          obstacleAvoidanceConfig: {
            enabled: true,
            minDistance: 0.5,
            detectionAngle: 180,
            avoidanceStrategy: 'stop-and-replan',
          },
        };
        break;

      case VehicleType.AGV:
        baseDto.agvSpecific = {
          guideType: input.guideType || GuideType.MAGNETIC,
          lineFollowingConfig: {
            sensitivity: 0.8,
            maxDeviation: 0.1,
            correctionSpeed: 0.5,
          },
          loadType: 'pallet',
          maxLoadWeight: input.loadCapacity || 500,
        };
        break;

      case VehicleType.OHT:
        baseDto.ohtSpecific = {
          railId: input.trackId || 'default-rail',
          railSegments: [
            {
              id: 'segment-1',
              startPosition: 0,
              endPosition: 100,
              name: 'Main Track',
            },
          ],
        };
        break;

      case VehicleType.FORKLIFT:
        // Forklift doesn't have specific configuration in current model
        break;
    }

    return baseDto;
  }

  /**
   * Converts SimplifiedUpdateVehicleInput to an update object.
   * Only includes fields that were actually provided in the input.
   */
  static toUpdateDto(input: SimplifiedUpdateVehicleInput, vehicleType: VehicleType): any {
    const updateDto: any = {};

    // Base fields
    if (input.name !== undefined) {
      updateDto.name = input.name;
    }

    if (input.status !== undefined) {
      updateDto.status = input.status;
    }

    // Build specification update if any spec fields are provided
    const hasSpecUpdate =
      input.maxSpeed !== undefined ||
      input.batteryCapacity !== undefined ||
      input.loadCapacity !== undefined;

    if (hasSpecUpdate) {
      updateDto.specification = {};
      if (input.maxSpeed !== undefined) {
        updateDto.specification.maxSpeed = input.maxSpeed;
      }
      if (input.batteryCapacity !== undefined) {
        updateDto.specification.batteryCapacity = input.batteryCapacity;
      }
      if (input.loadCapacity !== undefined) {
        updateDto.specification.maxLoad = input.loadCapacity;
      }
    }

    // Type-specific updates
    switch (vehicleType) {
      case VehicleType.AMR:
        if (input.maxSpeed !== undefined || input.batteryCapacity !== undefined) {
          // AMR specific updates would go here
          // For now, we handle them through specification
        }
        break;

      case VehicleType.AGV:
        if (input.guideType !== undefined || input.loadCapacity !== undefined) {
          updateDto.agvSpecific = {};
          if (input.guideType !== undefined) {
            updateDto.agvSpecific.guideType = input.guideType;
          }
          if (input.loadCapacity !== undefined) {
            updateDto.agvSpecific.maxLoadWeight = input.loadCapacity;
          }
        }
        break;

      case VehicleType.OHT:
        if (input.hoistStatus !== undefined || input.trackId !== undefined) {
          updateDto.ohtSpecific = {};
          if (input.trackId !== undefined) {
            updateDto.ohtSpecific.railId = input.trackId;
          }
          // Note: hoistStatus is runtime state, not persisted configuration
        }
        break;
    }

    return updateDto;
  }
}
