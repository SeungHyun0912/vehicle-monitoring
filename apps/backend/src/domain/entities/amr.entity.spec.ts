import { AMR, ObstacleAvoidanceConfig } from './amr.entity';
import {
  VehicleType,
  VehicleStatus,
  Manufacturer,
  VehicleSpecification,
  Dimensions,
} from '../value-objects';

describe('AMR Entity', () => {
  let amr: AMR;
  let manufacturer: Manufacturer;
  let specification: VehicleSpecification;
  let obstacleConfig: ObstacleAvoidanceConfig;

  beforeEach(() => {
    manufacturer = new Manufacturer('AMR Corp');
    specification = new VehicleSpecification(
      3.0,
      500,
      120,
      new Dimensions(1.2, 0.6, 1.0),
      150,
    );
    obstacleConfig = {
      enabled: true,
      minDistance: 0.5,
      detectionAngle: 180,
      avoidanceStrategy: 'STOP',
    };

    amr = new AMR(
      'amr-001',
      'AMR Test',
      manufacturer,
      specification,
      true, // lidarEnabled
      true, // cameraEnabled
      false, // ultrasonicEnabled
      3, // autonomyLevel
      obstacleConfig,
      'AMR-X100',
      'map-factory-1',
    );
  });

  describe('Constructor', () => {
    it('should create an AMR with correct properties', () => {
      expect(amr.id).toBe('amr-001');
      expect(amr.name).toBe('AMR Test');
      expect(amr.type).toBe(VehicleType.AMR);
      expect(amr.manufacturer).toBe(manufacturer);
      expect(amr.specification).toBe(specification);
      expect(amr.model).toBe('AMR-X100');
      expect(amr.mapId).toBe('map-factory-1');
    });

    it('should initialize with correct sensor settings', () => {
      expect(amr.lidarEnabled).toBe(true);
      expect(amr.cameraEnabled).toBe(true);
      expect(amr.ultrasonicEnabled).toBe(false);
    });

    it('should initialize with correct autonomy level', () => {
      expect(amr.autonomyLevel).toBe(3);
    });

    it('should initialize with obstacle avoidance config', () => {
      expect(amr.obstacleAvoidanceConfig).toEqual(obstacleConfig);
    });

    it('should throw error if autonomy level is below 0', () => {
      expect(() => {
        new AMR(
          'amr-002',
          'Invalid AMR',
          manufacturer,
          specification,
          true,
          true,
          true,
          -1, // Invalid autonomy level
          obstacleConfig,
        );
      }).toThrow('Autonomy level must be between 0 and 5');
    });

    it('should throw error if autonomy level is above 5', () => {
      expect(() => {
        new AMR(
          'amr-003',
          'Invalid AMR',
          manufacturer,
          specification,
          true,
          true,
          true,
          6, // Invalid autonomy level
          obstacleConfig,
        );
      }).toThrow('Autonomy level must be between 0 and 5');
    });

    it('should accept autonomy level 0', () => {
      const amr0 = new AMR(
        'amr-004',
        'Level 0 AMR',
        manufacturer,
        specification,
        true,
        true,
        true,
        0,
        obstacleConfig,
      );
      expect(amr0.autonomyLevel).toBe(0);
    });

    it('should accept autonomy level 5', () => {
      const amr5 = new AMR(
        'amr-005',
        'Level 5 AMR',
        manufacturer,
        specification,
        true,
        true,
        true,
        5,
        obstacleConfig,
      );
      expect(amr5.autonomyLevel).toBe(5);
    });
  });

  describe('setMap()', () => {
    it('should update the map ID', () => {
      amr.setMap('map-warehouse-2');
      expect(amr.mapId).toBe('map-warehouse-2');
    });

    it('should update the updatedAt timestamp', () => {
      const originalUpdatedAt = amr.updatedAt;

      setTimeout(() => {
        amr.setMap('map-new');
        expect(amr.updatedAt.getTime()).toBeGreaterThanOrEqual(
          originalUpdatedAt.getTime(),
        );
      }, 10);
    });
  });

  describe('updateObstacleAvoidanceConfig()', () => {
    it('should update obstacle avoidance config partially', () => {
      amr.updateObstacleAvoidanceConfig({
        minDistance: 1.0,
      });

      expect(amr.obstacleAvoidanceConfig.minDistance).toBe(1.0);
      expect(amr.obstacleAvoidanceConfig.enabled).toBe(true);
      expect(amr.obstacleAvoidanceConfig.detectionAngle).toBe(180);
      expect(amr.obstacleAvoidanceConfig.avoidanceStrategy).toBe('STOP');
    });

    it('should update multiple config fields', () => {
      amr.updateObstacleAvoidanceConfig({
        enabled: false,
        avoidanceStrategy: 'REROUTE',
      });

      expect(amr.obstacleAvoidanceConfig.enabled).toBe(false);
      expect(amr.obstacleAvoidanceConfig.avoidanceStrategy).toBe('REROUTE');
    });

    it('should update all config fields', () => {
      const newConfig: ObstacleAvoidanceConfig = {
        enabled: false,
        minDistance: 2.0,
        detectionAngle: 360,
        avoidanceStrategy: 'SLOW_DOWN',
      };

      amr.updateObstacleAvoidanceConfig(newConfig);
      expect(amr.obstacleAvoidanceConfig).toEqual(newConfig);
    });

    it('should update the updatedAt timestamp', () => {
      const originalUpdatedAt = amr.updatedAt;

      setTimeout(() => {
        amr.updateObstacleAvoidanceConfig({ enabled: false });
        expect(amr.updatedAt.getTime()).toBeGreaterThanOrEqual(
          originalUpdatedAt.getTime(),
        );
      }, 10);
    });
  });

  describe('getTypeSpecificInfo()', () => {
    it('should return AMR-specific information', () => {
      const info = amr.getTypeSpecificInfo();

      expect(info).toEqual({
        lidarEnabled: true,
        cameraEnabled: true,
        ultrasonicEnabled: false,
        autonomyLevel: 3,
        mapId: 'map-factory-1',
        obstacleAvoidanceConfig: obstacleConfig,
      });
    });

    it('should return updated information after changes', () => {
      amr.setMap('new-map');
      amr.updateObstacleAvoidanceConfig({ enabled: false });

      const info = amr.getTypeSpecificInfo();

      expect(info.mapId).toBe('new-map');
      expect(info.obstacleAvoidanceConfig.enabled).toBe(false);
    });
  });

  describe('Inherited Vehicle methods', () => {
    it('should enable the AMR', () => {
      amr.enable();
      expect(amr.isEnabled).toBe(true);
    });

    it('should disable the AMR', () => {
      amr.enable();
      amr.disable();
      expect(amr.isEnabled).toBe(false);
    });

    it('should update status', () => {
      amr.updateStatus(VehicleStatus.MOVING);
      expect(amr.status).toBe(VehicleStatus.MOVING);
    });

    it('should soft delete the AMR', () => {
      amr.softDelete();
      expect(amr.isDeleted()).toBe(true);
      expect(amr.deletedAt).toBeInstanceOf(Date);
    });
  });
});
