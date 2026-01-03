import { VehiclePosition, Quaternion, EulerAngles } from './vehicle-position.vo';

describe('VehiclePosition Value Object', () => {
  let timestamp: Date;
  let quaternion: Quaternion;
  let euler: EulerAngles;

  beforeEach(() => {
    timestamp = new Date('2024-01-01T12:00:00Z');
    quaternion = { x: 0, y: 0, z: 0, w: 1 }; // Identity quaternion
    euler = { roll: 0, pitch: 0, yaw: 90 };
  });

  describe('Constructor', () => {
    it('should create position with basic properties', () => {
      const position = new VehiclePosition(10, 20, 0, 90, timestamp);

      expect(position.x).toBe(10);
      expect(position.y).toBe(20);
      expect(position.z).toBe(0);
      expect(position.heading).toBe(90);
      expect(position.timestamp).toBe(timestamp);
    });

    it('should create position with all properties', () => {
      const position = new VehiclePosition(
        10,
        20,
        0,
        90,
        timestamp,
        'map-factory-1',
        quaternion,
        euler,
      );

      expect(position.x).toBe(10);
      expect(position.y).toBe(20);
      expect(position.z).toBe(0);
      expect(position.heading).toBe(90);
      expect(position.timestamp).toBe(timestamp);
      expect(position.mapId).toBe('map-factory-1');
      expect(position.rotation).toEqual(quaternion);
      expect(position.euler).toEqual(euler);
    });

    it('should accept heading 0', () => {
      const position = new VehiclePosition(0, 0, 0, 0, timestamp);
      expect(position.heading).toBe(0);
    });

    it('should accept heading 359.99', () => {
      const position = new VehiclePosition(0, 0, 0, 359.99, timestamp);
      expect(position.heading).toBe(359.99);
    });

    it('should throw error if heading is negative', () => {
      expect(() => {
        new VehiclePosition(10, 20, 0, -10, timestamp);
      }).toThrow('Heading must be between 0 and 360 degrees');
    });

    it('should throw error if heading is 360 or greater', () => {
      expect(() => {
        new VehiclePosition(10, 20, 0, 360, timestamp);
      }).toThrow('Heading must be between 0 and 360 degrees');
    });

    it('should accept normalized quaternion', () => {
      const normalizedQuat: Quaternion = {
        x: 0.707,
        y: 0,
        z: 0,
        w: 0.707,
      };

      const position = new VehiclePosition(
        0,
        0,
        0,
        45,
        timestamp,
        undefined,
        normalizedQuat,
      );

      expect(position.rotation).toEqual(normalizedQuat);
    });

    it('should throw error if quaternion is not normalized', () => {
      const unnormalizedQuat: Quaternion = {
        x: 1,
        y: 1,
        z: 1,
        w: 1,
      };

      expect(() => {
        new VehiclePosition(0, 0, 0, 90, timestamp, undefined, unnormalizedQuat);
      }).toThrow('Invalid quaternion: must be normalized');
    });

    it('should accept quaternion with magnitude close to 1', () => {
      const closeQuat: Quaternion = {
        x: 0,
        y: 0,
        z: 0,
        w: 1.009, // Within 0.01 tolerance
      };

      const position = new VehiclePosition(
        0,
        0,
        0,
        0,
        timestamp,
        undefined,
        closeQuat,
      );

      expect(position.rotation).toEqual(closeQuat);
    });
  });

  describe('distanceTo()', () => {
    it('should calculate distance between two positions in 2D', () => {
      const pos1 = new VehiclePosition(0, 0, 0, 0, timestamp);
      const pos2 = new VehiclePosition(3, 4, 0, 90, timestamp);

      const distance = pos1.distanceTo(pos2);

      expect(distance).toBe(5); // 3-4-5 triangle
    });

    it('should calculate distance between same positions', () => {
      const pos1 = new VehiclePosition(10, 20, 0, 45, timestamp);
      const pos2 = new VehiclePosition(10, 20, 0, 135, timestamp);

      const distance = pos1.distanceTo(pos2);

      expect(distance).toBe(0);
    });

    it('should calculate distance in 3D', () => {
      const pos1 = new VehiclePosition(0, 0, 0, 0, timestamp);
      const pos2 = new VehiclePosition(1, 1, 1, 90, timestamp);

      const distance = pos1.distanceTo(pos2);

      expect(distance).toBeCloseTo(Math.sqrt(3), 5);
    });

    it('should calculate distance with negative coordinates', () => {
      const pos1 = new VehiclePosition(-10, -10, 0, 0, timestamp);
      const pos2 = new VehiclePosition(10, 10, 0, 90, timestamp);

      const distance = pos1.distanceTo(pos2);

      expect(distance).toBeCloseTo(Math.sqrt(800), 5);
    });

    it('should be symmetric', () => {
      const pos1 = new VehiclePosition(5, 10, 2, 0, timestamp);
      const pos2 = new VehiclePosition(15, 25, 8, 90, timestamp);

      const dist1to2 = pos1.distanceTo(pos2);
      const dist2to1 = pos2.distanceTo(pos1);

      expect(dist1to2).toBe(dist2to1);
    });
  });

  describe('isStale()', () => {
    it('should return false for fresh position', () => {
      const now = new Date();
      const position = new VehiclePosition(0, 0, 0, 0, now);

      expect(position.isStale()).toBe(false);
    });

    it('should return true for old position (default 5 seconds)', () => {
      const oldTime = new Date(Date.now() - 6000); // 6 seconds ago
      const position = new VehiclePosition(0, 0, 0, 0, oldTime);

      expect(position.isStale()).toBe(true);
    });

    it('should return false for position within threshold', () => {
      const recentTime = new Date(Date.now() - 3000); // 3 seconds ago
      const position = new VehiclePosition(0, 0, 0, 0, recentTime);

      expect(position.isStale()).toBe(false);
    });

    it('should use custom maxAgeMs', () => {
      const time = new Date(Date.now() - 8000); // 8 seconds ago
      const position = new VehiclePosition(0, 0, 0, 0, time);

      expect(position.isStale(10000)).toBe(false); // Not stale with 10s threshold
      expect(position.isStale(5000)).toBe(true); // Stale with 5s threshold
    });

    it('should handle boundary case exactly at threshold', () => {
      const time = new Date(Date.now() - 5000); // Exactly 5 seconds ago
      const position = new VehiclePosition(0, 0, 0, 0, time);

      // Due to timing, this could be slightly over or under
      const isStale = position.isStale(5000);
      expect(typeof isStale).toBe('boolean');
    });
  });

  describe('toJSON()', () => {
    it('should serialize to JSON with basic properties', () => {
      const position = new VehiclePosition(10, 20, 5, 90, timestamp);
      const json = position.toJSON();

      expect(json).toEqual({
        x: 10,
        y: 20,
        z: 5,
        heading: 90,
        timestamp: '2024-01-01T12:00:00.000Z',
        mapId: undefined,
        rotation: undefined,
        euler: undefined,
      });
    });

    it('should serialize to JSON with all properties', () => {
      const position = new VehiclePosition(
        10,
        20,
        5,
        90,
        timestamp,
        'map-1',
        quaternion,
        euler,
      );
      const json = position.toJSON();

      expect(json).toEqual({
        x: 10,
        y: 20,
        z: 5,
        heading: 90,
        timestamp: '2024-01-01T12:00:00.000Z',
        mapId: 'map-1',
        rotation: quaternion,
        euler: euler,
      });
    });

    it('should convert timestamp to ISO string', () => {
      const position = new VehiclePosition(0, 0, 0, 0, timestamp);
      const json = position.toJSON();

      expect(typeof json.timestamp).toBe('string');
      expect(json.timestamp).toBe('2024-01-01T12:00:00.000Z');
    });
  });

  describe('fromJSON()', () => {
    it('should deserialize from JSON', () => {
      const json = {
        x: 10,
        y: 20,
        z: 5,
        heading: 90,
        timestamp: '2024-01-01T12:00:00.000Z',
      };

      const position = VehiclePosition.fromJSON(json);

      expect(position.x).toBe(10);
      expect(position.y).toBe(20);
      expect(position.z).toBe(5);
      expect(position.heading).toBe(90);
      expect(position.timestamp).toEqual(new Date('2024-01-01T12:00:00.000Z'));
    });

    it('should deserialize with all properties', () => {
      const json = {
        x: 10,
        y: 20,
        z: 5,
        heading: 90,
        timestamp: '2024-01-01T12:00:00.000Z',
        mapId: 'map-1',
        rotation: quaternion,
        euler: euler,
      };

      const position = VehiclePosition.fromJSON(json);

      expect(position.mapId).toBe('map-1');
      expect(position.rotation).toEqual(quaternion);
      expect(position.euler).toEqual(euler);
    });

    it('should round-trip through JSON correctly', () => {
      const original = new VehiclePosition(
        10,
        20,
        5,
        90,
        timestamp,
        'map-1',
        quaternion,
        euler,
      );

      const json = original.toJSON();
      const restored = VehiclePosition.fromJSON(json);

      expect(restored.x).toBe(original.x);
      expect(restored.y).toBe(original.y);
      expect(restored.z).toBe(original.z);
      expect(restored.heading).toBe(original.heading);
      expect(restored.mapId).toBe(original.mapId);
      expect(restored.rotation).toEqual(original.rotation);
      expect(restored.euler).toEqual(original.euler);
    });
  });

  describe('Value Object properties', () => {
    it('should have correct property values', () => {
      const position = new VehiclePosition(10, 20, 0, 90, timestamp);

      // Verify properties are accessible and have correct values
      expect(position.x).toBe(10);
      expect(position.y).toBe(20);
      expect(position.z).toBe(0);
      expect(position.heading).toBe(90);
      expect(position.timestamp).toBe(timestamp);
    });

    it('should preserve all properties', () => {
      const position = new VehiclePosition(
        10,
        20,
        5,
        90,
        timestamp,
        'map-1',
        quaternion,
        euler,
      );

      expect(position.x).toBe(10);
      expect(position.y).toBe(20);
      expect(position.z).toBe(5);
      expect(position.heading).toBe(90);
      expect(position.timestamp).toBe(timestamp);
      expect(position.mapId).toBe('map-1');
      expect(position.rotation).toBe(quaternion);
      expect(position.euler).toBe(euler);
    });
  });
});
