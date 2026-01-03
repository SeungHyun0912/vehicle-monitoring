import { SimplifiedVehicleMapper } from './simplified-vehicle.mapper';
import { VehicleType } from '../../../domain/value-objects';
import { GuideType } from '../../../domain/entities/agv.entity';

describe('SimplifiedVehicleMapper', () => {
  describe('toCreateDto() - AMR', () => {
    it('should convert simplified AMR input to full DTO', () => {
      const input = {
        name: 'AMR-001',
        type: VehicleType.AMR,
        status: 'IDLE' as any,
        isEnabled: true,
        maxSpeed: 3.0,
        batteryCapacity: 150,
      };

      const dto = SimplifiedVehicleMapper.toCreateDto(input);

      expect(dto.name).toBe('AMR-001');
      expect(dto.type).toBe(VehicleType.AMR);
      expect(dto.manufacturer).toBe('Default Manufacturer');
      expect(dto.model).toBe('AMR-Model');
      expect(dto.specification.maxSpeed).toBe(3.0);
      expect(dto.specification.batteryCapacity).toBe(150);
      expect(dto.specification.maxLoad).toBe(500); // Default
    });

    it('should provide AMR-specific defaults', () => {
      const input = {
        name: 'AMR-001',
        type: VehicleType.AMR,
      };

      const dto = SimplifiedVehicleMapper.toCreateDto(input);

      expect(dto.amrSpecific).toBeDefined();
      expect(dto.amrSpecific.lidarEnabled).toBe(true);
      expect(dto.amrSpecific.cameraEnabled).toBe(true);
      expect(dto.amrSpecific.ultrasonicEnabled).toBe(true);
      expect(dto.amrSpecific.autonomyLevel).toBe(3);
      expect(dto.amrSpecific.mapId).toBe('default-map');
      expect(dto.amrSpecific.obstacleAvoidanceConfig).toBeDefined();
      expect(dto.amrSpecific.obstacleAvoidanceConfig.enabled).toBe(true);
      expect(dto.amrSpecific.obstacleAvoidanceConfig.minDistance).toBe(0.5);
    });

    it('should use provided values over defaults', () => {
      const input = {
        name: 'AMR-001',
        type: VehicleType.AMR,
        maxSpeed: 5.0,
        batteryCapacity: 200,
      };

      const dto = SimplifiedVehicleMapper.toCreateDto(input);

      expect(dto.specification.maxSpeed).toBe(5.0);
      expect(dto.specification.batteryCapacity).toBe(200);
    });
  });

  describe('toCreateDto() - AGV', () => {
    it('should convert simplified AGV input to full DTO', () => {
      const input = {
        name: 'AGV-001',
        type: VehicleType.AGV,
        guideType: GuideType.LASER,
        loadCapacity: 1000,
      };

      const dto = SimplifiedVehicleMapper.toCreateDto(input);

      expect(dto.name).toBe('AGV-001');
      expect(dto.type).toBe(VehicleType.AGV);
      expect(dto.manufacturer).toBe('Default Manufacturer');
      expect(dto.model).toBe('AGV-Model');
    });

    it('should provide AGV-specific defaults', () => {
      const input = {
        name: 'AGV-001',
        type: VehicleType.AGV,
      };

      const dto = SimplifiedVehicleMapper.toCreateDto(input);

      expect(dto.agvSpecific).toBeDefined();
      expect(dto.agvSpecific.guideType).toBe(GuideType.MAGNETIC);
      expect(dto.agvSpecific.maxLoadWeight).toBe(500); // Default
      expect(dto.agvSpecific.loadType).toBe('pallet');
      expect(dto.agvSpecific.lineFollowingConfig).toBeDefined();
      expect(dto.agvSpecific.lineFollowingConfig.sensitivity).toBe(0.8);
    });

    it('should use provided guide type and load capacity', () => {
      const input = {
        name: 'AGV-001',
        type: VehicleType.AGV,
        guideType: GuideType.WIRE,
        loadCapacity: 1500,
      };

      const dto = SimplifiedVehicleMapper.toCreateDto(input);

      expect(dto.agvSpecific.guideType).toBe(GuideType.WIRE);
      expect(dto.agvSpecific.maxLoadWeight).toBe(1500);
      expect(dto.specification.maxLoad).toBe(1500);
    });
  });

  describe('toCreateDto() - OHT', () => {
    it('should convert simplified OHT input to full DTO', () => {
      const input = {
        name: 'OHT-001',
        type: VehicleType.OHT,
        trackId: 'track-main-1',
      };

      const dto = SimplifiedVehicleMapper.toCreateDto(input);

      expect(dto.name).toBe('OHT-001');
      expect(dto.type).toBe(VehicleType.OHT);
      expect(dto.manufacturer).toBe('Default Manufacturer');
      expect(dto.model).toBe('OHT-Model');
    });

    it('should provide OHT-specific defaults', () => {
      const input = {
        name: 'OHT-001',
        type: VehicleType.OHT,
      };

      const dto = SimplifiedVehicleMapper.toCreateDto(input);

      expect(dto.ohtSpecific).toBeDefined();
      expect(dto.ohtSpecific.railId).toBe('default-rail');
      expect(dto.ohtSpecific.railSegments).toBeDefined();
      expect(dto.ohtSpecific.railSegments).toHaveLength(1);
      expect(dto.ohtSpecific.railSegments[0].id).toBe('segment-1');
    });

    it('should use provided track ID', () => {
      const input = {
        name: 'OHT-001',
        type: VehicleType.OHT,
        trackId: 'custom-track',
      };

      const dto = SimplifiedVehicleMapper.toCreateDto(input);

      expect(dto.ohtSpecific.railId).toBe('custom-track');
    });
  });

  describe('toCreateDto() - FORKLIFT', () => {
    it('should handle forklift type without specific config', () => {
      const input = {
        name: 'FORKLIFT-001',
        type: VehicleType.FORKLIFT,
        loadCapacity: 2000,
      };

      const dto = SimplifiedVehicleMapper.toCreateDto(input);

      expect(dto.name).toBe('FORKLIFT-001');
      expect(dto.type).toBe(VehicleType.FORKLIFT);
      expect(dto.specification.maxLoad).toBe(2000);
    });
  });

  describe('toCreateDto() - Common defaults', () => {
    it('should provide common specification defaults', () => {
      const input = {
        name: 'TEST-001',
        type: VehicleType.AMR,
      };

      const dto = SimplifiedVehicleMapper.toCreateDto(input);

      expect(dto.specification.dimensions).toBeDefined();
      expect(dto.specification.dimensions.length).toBe(1.5);
      expect(dto.specification.dimensions.width).toBe(0.8);
      expect(dto.specification.dimensions.height).toBe(1.2);
      expect(dto.specification.weight).toBe(200);
    });

    it('should use default values when fields are omitted', () => {
      const input = {
        name: 'TEST-001',
        type: VehicleType.AMR,
      };

      const dto = SimplifiedVehicleMapper.toCreateDto(input);

      expect(dto.specification.maxSpeed).toBe(2.0);
      expect(dto.specification.batteryCapacity).toBe(100);
      expect(dto.specification.maxLoad).toBe(500);
    });
  });

  describe('toUpdateDto() - AMR', () => {
    it('should convert partial AMR update', () => {
      const input = {
        name: 'AMR-001-Updated',
        maxSpeed: 4.0,
      };

      const dto = SimplifiedVehicleMapper.toUpdateDto(input, VehicleType.AMR);

      expect(dto.name).toBe('AMR-001-Updated');
      expect(dto.specification).toBeDefined();
      expect(dto.specification.maxSpeed).toBe(4.0);
      expect(dto.specification.batteryCapacity).toBeUndefined();
    });

    it('should only include provided fields', () => {
      const input = {
        batteryCapacity: 180,
      };

      const dto = SimplifiedVehicleMapper.toUpdateDto(input, VehicleType.AMR);

      expect(dto.name).toBeUndefined();
      expect(dto.status).toBeUndefined();
      expect(dto.specification).toBeDefined();
      expect(dto.specification.batteryCapacity).toBe(180);
      expect(dto.specification.maxSpeed).toBeUndefined();
    });

    it('should handle status update', () => {
      const input = {
        status: 'CHARGING' as any,
      };

      const dto = SimplifiedVehicleMapper.toUpdateDto(input, VehicleType.AMR);

      expect(dto.status).toBe('CHARGING');
    });
  });

  describe('toUpdateDto() - AGV', () => {
    it('should update AGV-specific fields', () => {
      const input = {
        guideType: GuideType.VISION,
        loadCapacity: 900,
      };

      const dto = SimplifiedVehicleMapper.toUpdateDto(input, VehicleType.AGV);

      expect(dto.agvSpecific).toBeDefined();
      expect(dto.agvSpecific.guideType).toBe(GuideType.VISION);
      expect(dto.agvSpecific.maxLoadWeight).toBe(900);
    });

    it('should update only guide type', () => {
      const input = {
        guideType: GuideType.LASER,
      };

      const dto = SimplifiedVehicleMapper.toUpdateDto(input, VehicleType.AGV);

      expect(dto.agvSpecific).toBeDefined();
      expect(dto.agvSpecific.guideType).toBe(GuideType.LASER);
      expect(dto.agvSpecific.maxLoadWeight).toBeUndefined();
    });
  });

  describe('toUpdateDto() - OHT', () => {
    it('should update OHT track ID', () => {
      const input = {
        trackId: 'new-track-id',
      };

      const dto = SimplifiedVehicleMapper.toUpdateDto(input, VehicleType.OHT);

      expect(dto.ohtSpecific).toBeDefined();
      expect(dto.ohtSpecific.railId).toBe('new-track-id');
    });

    it('should handle hoistStatus in update (note: runtime state)', () => {
      const input = {
        hoistStatus: 'DOWN' as any,
      };

      const dto = SimplifiedVehicleMapper.toUpdateDto(input, VehicleType.OHT);

      // HoistStatus is runtime state, not persisted configuration
      // Mapper handles it but doesn't set it in ohtSpecific
      expect(dto.ohtSpecific).toBeDefined();
    });
  });

  describe('toUpdateDto() - Empty updates', () => {
    it('should return empty object when no fields provided', () => {
      const input = {};

      const dto = SimplifiedVehicleMapper.toUpdateDto(input, VehicleType.AMR);

      expect(Object.keys(dto)).toHaveLength(0);
    });

    it('should not create specification if no spec fields provided', () => {
      const input = {
        name: 'Updated Name',
      };

      const dto = SimplifiedVehicleMapper.toUpdateDto(input, VehicleType.AMR);

      expect(dto.name).toBe('Updated Name');
      expect(dto.specification).toBeUndefined();
    });
  });

  describe('toUpdateDto() - Combined updates', () => {
    it('should handle multiple field updates', () => {
      const input = {
        name: 'Updated Vehicle',
        status: 'MOVING' as any,
        maxSpeed: 3.5,
        batteryCapacity: 160,
      };

      const dto = SimplifiedVehicleMapper.toUpdateDto(input, VehicleType.AMR);

      expect(dto.name).toBe('Updated Vehicle');
      expect(dto.status).toBe('MOVING');
      expect(dto.specification.maxSpeed).toBe(3.5);
      expect(dto.specification.batteryCapacity).toBe(160);
    });
  });
});
