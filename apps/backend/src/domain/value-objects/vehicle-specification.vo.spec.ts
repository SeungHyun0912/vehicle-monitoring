import { VehicleSpecification, Dimensions } from './vehicle-specification.vo';

describe('VehicleSpecification Value Object', () => {
  describe('Constructor', () => {
    it('should create specification with valid values', () => {
      const spec = new VehicleSpecification(
        2.5, // maxSpeed
        1000, // maxLoad
        100, // batteryCapacity
        { length: 1.5, width: 0.8, height: 1.2 },
        200, // weight
      );

      expect(spec.maxSpeed).toBe(2.5);
      expect(spec.maxLoad).toBe(1000);
      expect(spec.batteryCapacity).toBe(100);
      expect(spec.dimensions).toEqual({ length: 1.5, width: 0.8, height: 1.2 });
      expect(spec.weight).toBe(200);
    });

    it('should create specification without optional fields', () => {
      const spec = new VehicleSpecification(
        3.0, // maxSpeed
        500, // maxLoad
        80, // batteryCapacity
      );

      expect(spec.maxSpeed).toBe(3.0);
      expect(spec.maxLoad).toBe(500);
      expect(spec.batteryCapacity).toBe(80);
      expect(spec.dimensions).toBeUndefined();
      expect(spec.weight).toBeUndefined();
    });

    it('should throw error if maxSpeed is 0', () => {
      expect(() => {
        new VehicleSpecification(0, 500, 100);
      }).toThrow('Max speed must be greater than 0');
    });

    it('should throw error if maxSpeed is negative', () => {
      expect(() => {
        new VehicleSpecification(-1.5, 500, 100);
      }).toThrow('Max speed must be greater than 0');
    });

    it('should allow maxLoad to be 0', () => {
      const spec = new VehicleSpecification(2.0, 0, 100);
      expect(spec.maxLoad).toBe(0);
    });

    it('should throw error if maxLoad is negative', () => {
      expect(() => {
        new VehicleSpecification(2.0, -100, 100);
      }).toThrow('Max load must be non-negative');
    });

    it('should throw error if batteryCapacity is 0', () => {
      expect(() => {
        new VehicleSpecification(2.0, 500, 0);
      }).toThrow('Battery capacity must be greater than 0');
    });

    it('should throw error if batteryCapacity is negative', () => {
      expect(() => {
        new VehicleSpecification(2.0, 500, -50);
      }).toThrow('Battery capacity must be greater than 0');
    });
  });

  describe('Dimensions', () => {
    it('should store dimensions correctly', () => {
      const spec = new VehicleSpecification(
        2.0,
        500,
        100,
        { length: 2.0, width: 1.0, height: 1.5 },
      );

      expect(spec.dimensions?.length).toBe(2.0);
      expect(spec.dimensions?.width).toBe(1.0);
      expect(spec.dimensions?.height).toBe(1.5);
    });

    it('should allow partial dimensions (all fields required if provided)', () => {
      const spec = new VehicleSpecification(
        2.0,
        500,
        100,
        { length: 1.0, width: 1.0, height: 1.0 },
      );

      expect(spec.dimensions).toBeDefined();
    });
  });

  describe('Weight', () => {
    it('should store weight correctly', () => {
      const spec = new VehicleSpecification(2.0, 500, 100, undefined, 300);

      expect(spec.weight).toBe(300);
    });

    it('should allow weight to be undefined', () => {
      const spec = new VehicleSpecification(2.0, 500, 100);

      expect(spec.weight).toBeUndefined();
    });
  });

  describe('Value Object properties', () => {
    it('should have correct property values', () => {
      const spec = new VehicleSpecification(2.0, 500, 100);

      // Verify properties are accessible and have correct values
      expect(spec.maxSpeed).toBe(2.0);
      expect(spec.maxLoad).toBe(500);
      expect(spec.batteryCapacity).toBe(100);
    });

    it('should preserve all properties', () => {
      const dimensions = new Dimensions(1.5, 0.8, 1.2);
      const spec = new VehicleSpecification(
        2.0,
        500,
        100,
        dimensions,
        200,
      );

      expect(spec.maxSpeed).toBe(2.0);
      expect(spec.maxLoad).toBe(500);
      expect(spec.batteryCapacity).toBe(100);
      expect(spec.dimensions).toBe(dimensions);
      expect(spec.weight).toBe(200);
    });
  });

  describe('Edge cases', () => {
    it('should accept very small positive maxSpeed', () => {
      const spec = new VehicleSpecification(0.1, 500, 100);
      expect(spec.maxSpeed).toBe(0.1);
    });

    it('should accept very large values', () => {
      const spec = new VehicleSpecification(
        100, // maxSpeed
        50000, // maxLoad
        10000, // batteryCapacity
        { length: 10, width: 5, height: 3 },
        5000, // weight
      );

      expect(spec.maxSpeed).toBe(100);
      expect(spec.maxLoad).toBe(50000);
      expect(spec.batteryCapacity).toBe(10000);
    });
  });
});
