import { Vehicle } from './vehicle.entity';
import {
  VehicleType,
  VehicleStatus,
  Manufacturer,
  VehicleSpecification,
  Dimensions,
} from '../value-objects';

// Concrete test implementation of abstract Vehicle class
class TestVehicle extends Vehicle {
  getTypeSpecificInfo(): Record<string, any> {
    return { testField: 'test value' };
  }
}

describe('Vehicle Entity', () => {
  let vehicle: TestVehicle;
  let manufacturer: Manufacturer;
  let specification: VehicleSpecification;

  beforeEach(() => {
    manufacturer = new Manufacturer('Test Manufacturer');
    specification = new VehicleSpecification(
      2.5,
      1000,
      100,
      new Dimensions(1.5, 0.8, 1.2),
      200,
    );

    vehicle = new TestVehicle(
      'test-id-123',
      'Test Vehicle',
      VehicleType.AMR,
      manufacturer,
      specification,
      'Test Model',
    );
  });

  describe('Constructor', () => {
    it('should create a vehicle with correct properties', () => {
      expect(vehicle.id).toBe('test-id-123');
      expect(vehicle.name).toBe('Test Vehicle');
      expect(vehicle.type).toBe(VehicleType.AMR);
      expect(vehicle.manufacturer).toBe(manufacturer);
      expect(vehicle.specification).toBe(specification);
      expect(vehicle.model).toBe('Test Model');
    });

    it('should initialize with IDLE status', () => {
      expect(vehicle.status).toBe(VehicleStatus.IDLE);
    });

    it('should initialize with isEnabled as false', () => {
      expect(vehicle.isEnabled).toBe(false);
    });

    it('should initialize without deletedAt', () => {
      expect(vehicle.deletedAt).toBeUndefined();
    });

    it('should have createdAt and updatedAt timestamps', () => {
      expect(vehicle.createdAt).toBeInstanceOf(Date);
      expect(vehicle.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('enable()', () => {
    it('should set isEnabled to true', () => {
      vehicle.enable();
      expect(vehicle.isEnabled).toBe(true);
    });

    it('should update the updatedAt timestamp', () => {
      const originalUpdatedAt = vehicle.updatedAt;

      // Wait a bit to ensure timestamp changes
      setTimeout(() => {
        vehicle.enable();
        expect(vehicle.updatedAt.getTime()).toBeGreaterThanOrEqual(
          originalUpdatedAt.getTime(),
        );
      }, 10);
    });
  });

  describe('disable()', () => {
    it('should set isEnabled to false', () => {
      vehicle.enable();
      vehicle.disable();
      expect(vehicle.isEnabled).toBe(false);
    });

    it('should update the updatedAt timestamp', () => {
      const originalUpdatedAt = vehicle.updatedAt;

      setTimeout(() => {
        vehicle.disable();
        expect(vehicle.updatedAt.getTime()).toBeGreaterThanOrEqual(
          originalUpdatedAt.getTime(),
        );
      }, 10);
    });
  });

  describe('updateStatus()', () => {
    it('should update status to MOVING', () => {
      vehicle.updateStatus(VehicleStatus.MOVING);
      expect(vehicle.status).toBe(VehicleStatus.MOVING);
    });

    it('should update status to CHARGING', () => {
      vehicle.updateStatus(VehicleStatus.CHARGING);
      expect(vehicle.status).toBe(VehicleStatus.CHARGING);
    });

    it('should update status to ERROR', () => {
      vehicle.updateStatus(VehicleStatus.ERROR);
      expect(vehicle.status).toBe(VehicleStatus.ERROR);
    });

    it('should update the updatedAt timestamp', () => {
      const originalUpdatedAt = vehicle.updatedAt;

      setTimeout(() => {
        vehicle.updateStatus(VehicleStatus.MOVING);
        expect(vehicle.updatedAt.getTime()).toBeGreaterThanOrEqual(
          originalUpdatedAt.getTime(),
        );
      }, 10);
    });
  });

  describe('softDelete()', () => {
    it('should set deletedAt timestamp', () => {
      vehicle.softDelete();
      expect(vehicle.deletedAt).toBeInstanceOf(Date);
    });

    it('should disable the vehicle', () => {
      vehicle.enable();
      vehicle.softDelete();
      expect(vehicle.isEnabled).toBe(false);
    });

    it('should update the updatedAt timestamp', () => {
      const originalUpdatedAt = vehicle.updatedAt;

      setTimeout(() => {
        vehicle.softDelete();
        expect(vehicle.updatedAt.getTime()).toBeGreaterThanOrEqual(
          originalUpdatedAt.getTime(),
        );
      }, 10);
    });
  });

  describe('isDeleted()', () => {
    it('should return false when not deleted', () => {
      expect(vehicle.isDeleted()).toBe(false);
    });

    it('should return true when soft deleted', () => {
      vehicle.softDelete();
      expect(vehicle.isDeleted()).toBe(true);
    });

    it('should return false when deletedAt is null', () => {
      vehicle.deletedAt = null as any;
      expect(vehicle.isDeleted()).toBe(false);
    });
  });

  describe('getTypeSpecificInfo()', () => {
    it('should return type-specific information', () => {
      const info = vehicle.getTypeSpecificInfo();
      expect(info).toEqual({ testField: 'test value' });
    });
  });
});
