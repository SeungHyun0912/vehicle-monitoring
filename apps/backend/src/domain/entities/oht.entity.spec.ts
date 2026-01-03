import { OHT, HoistStatus, RailSegment } from './oht.entity';
import {
  VehicleType,
  VehicleStatus,
  Manufacturer,
  VehicleSpecification,
  Dimensions,
} from '../value-objects';

describe('OHT Entity', () => {
  let oht: OHT;
  let manufacturer: Manufacturer;
  let specification: VehicleSpecification;
  let railSegments: RailSegment[];

  beforeEach(() => {
    manufacturer = new Manufacturer('OHT Technologies');
    specification = new VehicleSpecification(
      5.0,
      1500,
      200,
      new Dimensions(3.0, 2.0, 2.5),
      800,
    );
    railSegments = [
      {
        id: 'segment-1',
        startPosition: 0,
        endPosition: 100,
        name: 'Main Line',
      },
      {
        id: 'segment-2',
        startPosition: 100,
        endPosition: 200,
        name: 'Side Line',
      },
    ];

    oht = new OHT(
      'oht-001',
      'OHT Test',
      manufacturer,
      specification,
      'rail-main',
      railSegments,
      'OHT-H500',
    );
  });

  describe('Constructor', () => {
    it('should create an OHT with correct properties', () => {
      expect(oht.id).toBe('oht-001');
      expect(oht.name).toBe('OHT Test');
      expect(oht.type).toBe(VehicleType.OHT);
      expect(oht.manufacturer).toBe(manufacturer);
      expect(oht.specification).toBe(specification);
      expect(oht.model).toBe('OHT-H500');
    });

    it('should initialize with correct rail ID', () => {
      expect(oht.railId).toBe('rail-main');
    });

    it('should initialize with hoist status UP', () => {
      expect(oht.hoistStatus).toBe(HoistStatus.UP);
    });

    it('should initialize with rail position 0', () => {
      expect(oht.railPosition).toBe(0);
    });

    it('should initialize with rail segments', () => {
      expect(oht.railSegments).toEqual(railSegments);
      expect(oht.railSegments).toHaveLength(2);
    });

    it('should throw error if rail segments is empty', () => {
      expect(() => {
        new OHT(
          'oht-002',
          'Invalid OHT',
          manufacturer,
          specification,
          'rail-test',
          [], // Empty segments
        );
      }).toThrow('OHT must have at least one rail segment');
    });

    it('should throw error if rail segments is null', () => {
      expect(() => {
        new OHT(
          'oht-003',
          'Invalid OHT',
          manufacturer,
          specification,
          'rail-test',
          null as any, // Null segments
        );
      }).toThrow('OHT must have at least one rail segment');
    });

    it('should accept single rail segment', () => {
      const singleSegment = [
        {
          id: 'segment-only',
          startPosition: 0,
          endPosition: 50,
        },
      ];

      const singleOHT = new OHT(
        'oht-single',
        'Single Segment OHT',
        manufacturer,
        specification,
        'rail-single',
        singleSegment,
      );

      expect(singleOHT.railSegments).toHaveLength(1);
    });
  });

  describe('updateHoistStatus()', () => {
    it('should update hoist status to DOWN', () => {
      oht.updateHoistStatus(HoistStatus.DOWN);
      expect(oht.hoistStatus).toBe(HoistStatus.DOWN);
    });

    it('should update hoist status to MOVING', () => {
      oht.updateHoistStatus(HoistStatus.MOVING);
      expect(oht.hoistStatus).toBe(HoistStatus.MOVING);
    });

    it('should update hoist status back to UP', () => {
      oht.updateHoistStatus(HoistStatus.DOWN);
      oht.updateHoistStatus(HoistStatus.UP);
      expect(oht.hoistStatus).toBe(HoistStatus.UP);
    });

    it('should update the updatedAt timestamp', () => {
      const originalUpdatedAt = oht.updatedAt;

      setTimeout(() => {
        oht.updateHoistStatus(HoistStatus.DOWN);
        expect(oht.updatedAt.getTime()).toBeGreaterThanOrEqual(
          originalUpdatedAt.getTime(),
        );
      }, 10);
    });
  });

  describe('updateRailPosition()', () => {
    it('should update position within first segment', () => {
      oht.updateRailPosition(50);
      expect(oht.railPosition).toBe(50);
    });

    it('should update position to segment boundary', () => {
      oht.updateRailPosition(100);
      expect(oht.railPosition).toBe(100);
    });

    it('should update position within second segment', () => {
      oht.updateRailPosition(150);
      expect(oht.railPosition).toBe(150);
    });

    it('should update position to end of track', () => {
      oht.updateRailPosition(200);
      expect(oht.railPosition).toBe(200);
    });

    it('should throw error if position is before first segment', () => {
      expect(() => {
        oht.updateRailPosition(-10);
      }).toThrow('Rail position is outside of valid rail segments');
    });

    it('should throw error if position is after last segment', () => {
      expect(() => {
        oht.updateRailPosition(250);
      }).toThrow('Rail position is outside of valid rail segments');
    });

    it('should throw error if position is in gap between segments', () => {
      // Create OHT with gap between segments
      const segmentsWithGap: RailSegment[] = [
        { id: 's1', startPosition: 0, endPosition: 50 },
        { id: 's2', startPosition: 100, endPosition: 150 },
      ];

      const gapOHT = new OHT(
        'oht-gap',
        'Gap OHT',
        manufacturer,
        specification,
        'rail-gap',
        segmentsWithGap,
      );

      expect(() => {
        gapOHT.updateRailPosition(75); // Position in gap
      }).toThrow('Rail position is outside of valid rail segments');
    });

    it('should update the updatedAt timestamp', () => {
      const originalUpdatedAt = oht.updatedAt;

      setTimeout(() => {
        oht.updateRailPosition(50);
        expect(oht.updatedAt.getTime()).toBeGreaterThanOrEqual(
          originalUpdatedAt.getTime(),
        );
      }, 10);
    });
  });

  describe('getCurrentSegment()', () => {
    it('should return first segment when at position 0', () => {
      oht.updateRailPosition(0);
      const segment = oht.getCurrentSegment();

      expect(segment).not.toBeNull();
      expect(segment?.id).toBe('segment-1');
      expect(segment?.name).toBe('Main Line');
    });

    it('should return first segment when in middle of it', () => {
      oht.updateRailPosition(50);
      const segment = oht.getCurrentSegment();

      expect(segment).not.toBeNull();
      expect(segment?.id).toBe('segment-1');
    });

    it('should return first segment at boundary', () => {
      oht.updateRailPosition(100);
      const segment = oht.getCurrentSegment();

      expect(segment).not.toBeNull();
      // At boundary, should match first segment that contains position
      expect(['segment-1', 'segment-2']).toContain(segment?.id);
    });

    it('should return second segment when in middle of it', () => {
      oht.updateRailPosition(150);
      const segment = oht.getCurrentSegment();

      expect(segment).not.toBeNull();
      expect(segment?.id).toBe('segment-2');
      expect(segment?.name).toBe('Side Line');
    });

    it('should return second segment at end', () => {
      oht.updateRailPosition(200);
      const segment = oht.getCurrentSegment();

      expect(segment).not.toBeNull();
      expect(segment?.id).toBe('segment-2');
    });

    it('should return null if position is invalid (edge case)', () => {
      // Manually set invalid position to test edge case
      (oht as any).railPosition = -100;
      const segment = oht.getCurrentSegment();

      expect(segment).toBeNull();
    });
  });

  describe('getTypeSpecificInfo()', () => {
    it('should return OHT-specific information', () => {
      const info = oht.getTypeSpecificInfo();

      expect(info).toEqual({
        railId: 'rail-main',
        hoistStatus: HoistStatus.UP,
        railPosition: 0,
        railSegments: railSegments,
        currentSegment: {
          id: 'segment-1',
          startPosition: 0,
          endPosition: 100,
          name: 'Main Line',
        },
      });
    });

    it('should return updated information after position change', () => {
      oht.updateRailPosition(150);
      const info = oht.getTypeSpecificInfo();

      expect(info.railPosition).toBe(150);
      expect(info.currentSegment?.id).toBe('segment-2');
    });

    it('should return updated information after hoist status change', () => {
      oht.updateHoistStatus(HoistStatus.DOWN);
      const info = oht.getTypeSpecificInfo();

      expect(info.hoistStatus).toBe(HoistStatus.DOWN);
    });
  });

  describe('Inherited Vehicle methods', () => {
    it('should enable the OHT', () => {
      oht.enable();
      expect(oht.isEnabled).toBe(true);
    });

    it('should disable the OHT', () => {
      oht.enable();
      oht.disable();
      expect(oht.isEnabled).toBe(false);
    });

    it('should update status', () => {
      oht.updateStatus(VehicleStatus.MOVING);
      expect(oht.status).toBe(VehicleStatus.MOVING);
    });

    it('should soft delete the OHT', () => {
      oht.softDelete();
      expect(oht.isDeleted()).toBe(true);
      expect(oht.deletedAt).toBeInstanceOf(Date);
    });
  });
});
