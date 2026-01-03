import { AGV, GuideType, LineFollowingConfig } from './agv.entity';
import {
  VehicleType,
  VehicleStatus,
  Manufacturer,
  VehicleSpecification,
  Dimensions,
} from '../value-objects';

describe('AGV Entity', () => {
  let agv: AGV;
  let manufacturer: Manufacturer;
  let specification: VehicleSpecification;
  let lineFollowingConfig: LineFollowingConfig;

  beforeEach(() => {
    manufacturer = new Manufacturer('AGV Systems');
    specification = new VehicleSpecification(
      2.0,
      800,
      80,
      new Dimensions(2.0, 1.0, 1.5),
      300,
    );
    lineFollowingConfig = {
      sensitivity: 0.8,
      maxDeviation: 0.1,
      correctionSpeed: 0.5,
    };

    agv = new AGV(
      'agv-001',
      'AGV Test',
      manufacturer,
      specification,
      GuideType.MAGNETIC,
      lineFollowingConfig,
      'pallet',
      800,
      'AGV-P200',
    );
  });

  describe('Constructor', () => {
    it('should create an AGV with correct properties', () => {
      expect(agv.id).toBe('agv-001');
      expect(agv.name).toBe('AGV Test');
      expect(agv.type).toBe(VehicleType.AGV);
      expect(agv.manufacturer).toBe(manufacturer);
      expect(agv.specification).toBe(specification);
      expect(agv.model).toBe('AGV-P200');
    });

    it('should initialize with correct guide type', () => {
      expect(agv.guideType).toBe(GuideType.MAGNETIC);
    });

    it('should initialize with line following config', () => {
      expect(agv.lineFollowingConfig).toEqual(lineFollowingConfig);
    });

    it('should initialize with load type and max weight', () => {
      expect(agv.loadType).toBe('pallet');
      expect(agv.maxLoadWeight).toBe(800);
    });

    it('should throw error if max load weight is 0', () => {
      expect(() => {
        new AGV(
          'agv-002',
          'Invalid AGV',
          manufacturer,
          specification,
          GuideType.LASER,
          lineFollowingConfig,
          'box',
          0, // Invalid weight
        );
      }).toThrow('Max load weight must be greater than 0');
    });

    it('should throw error if max load weight is negative', () => {
      expect(() => {
        new AGV(
          'agv-003',
          'Invalid AGV',
          manufacturer,
          specification,
          GuideType.WIRE,
          lineFollowingConfig,
          'box',
          -100, // Invalid weight
        );
      }).toThrow('Max load weight must be greater than 0');
    });

    it('should accept all guide types', () => {
      const magnetic = new AGV(
        'agv-m',
        'Magnetic AGV',
        manufacturer,
        specification,
        GuideType.MAGNETIC,
        lineFollowingConfig,
        'pallet',
        500,
      );
      expect(magnetic.guideType).toBe(GuideType.MAGNETIC);

      const laser = new AGV(
        'agv-l',
        'Laser AGV',
        manufacturer,
        specification,
        GuideType.LASER,
        lineFollowingConfig,
        'pallet',
        500,
      );
      expect(laser.guideType).toBe(GuideType.LASER);

      const wire = new AGV(
        'agv-w',
        'Wire AGV',
        manufacturer,
        specification,
        GuideType.WIRE,
        lineFollowingConfig,
        'pallet',
        500,
      );
      expect(wire.guideType).toBe(GuideType.WIRE);

      const vision = new AGV(
        'agv-v',
        'Vision AGV',
        manufacturer,
        specification,
        GuideType.VISION,
        lineFollowingConfig,
        'pallet',
        500,
      );
      expect(vision.guideType).toBe(GuideType.VISION);
    });
  });

  describe('updateLineFollowingConfig()', () => {
    it('should update line following config partially', () => {
      agv.updateLineFollowingConfig({
        sensitivity: 0.9,
      });

      expect(agv.lineFollowingConfig.sensitivity).toBe(0.9);
      expect(agv.lineFollowingConfig.maxDeviation).toBe(0.1);
      expect(agv.lineFollowingConfig.correctionSpeed).toBe(0.5);
    });

    it('should update multiple config fields', () => {
      agv.updateLineFollowingConfig({
        maxDeviation: 0.2,
        correctionSpeed: 0.7,
      });

      expect(agv.lineFollowingConfig.maxDeviation).toBe(0.2);
      expect(agv.lineFollowingConfig.correctionSpeed).toBe(0.7);
      expect(agv.lineFollowingConfig.sensitivity).toBe(0.8);
    });

    it('should update all config fields', () => {
      const newConfig: LineFollowingConfig = {
        sensitivity: 1.0,
        maxDeviation: 0.05,
        correctionSpeed: 1.0,
      };

      agv.updateLineFollowingConfig(newConfig);
      expect(agv.lineFollowingConfig).toEqual(newConfig);
    });

    it('should update the updatedAt timestamp', () => {
      const originalUpdatedAt = agv.updatedAt;

      setTimeout(() => {
        agv.updateLineFollowingConfig({ sensitivity: 0.95 });
        expect(agv.updatedAt.getTime()).toBeGreaterThanOrEqual(
          originalUpdatedAt.getTime(),
        );
      }, 10);
    });
  });

  describe('getTypeSpecificInfo()', () => {
    it('should return AGV-specific information', () => {
      const info = agv.getTypeSpecificInfo();

      expect(info).toEqual({
        guideType: GuideType.MAGNETIC,
        lineFollowingConfig: lineFollowingConfig,
        loadType: 'pallet',
        maxLoadWeight: 800,
      });
    });

    it('should return updated information after changes', () => {
      agv.updateLineFollowingConfig({ sensitivity: 0.95 });

      const info = agv.getTypeSpecificInfo();

      expect(info.lineFollowingConfig.sensitivity).toBe(0.95);
    });
  });

  describe('Inherited Vehicle methods', () => {
    it('should enable the AGV', () => {
      agv.enable();
      expect(agv.isEnabled).toBe(true);
    });

    it('should disable the AGV', () => {
      agv.enable();
      agv.disable();
      expect(agv.isEnabled).toBe(false);
    });

    it('should update status', () => {
      agv.updateStatus(VehicleStatus.MOVING);
      expect(agv.status).toBe(VehicleStatus.MOVING);
    });

    it('should soft delete the AGV', () => {
      agv.softDelete();
      expect(agv.isDeleted()).toBe(true);
      expect(agv.deletedAt).toBeInstanceOf(Date);
    });
  });
});
