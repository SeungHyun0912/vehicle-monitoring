import { Test, TestingModule } from '@nestjs/testing';
import { CreateVehicleUseCase, CreateVehicleDto } from './create-vehicle.use-case';
import { VehicleRepository } from '../../../infrastructure/database/repositories/vehicle.repository';
import { RedisVehiclePositionRepository } from '../../../infrastructure/redis/repositories/redis-vehicle-position.repository';
import { VehicleType } from '../../../domain/value-objects';
import { AMR } from '../../../domain/entities/amr.entity';
import { AGV, GuideType } from '../../../domain/entities/agv.entity';
import { OHT } from '../../../domain/entities/oht.entity';

describe('CreateVehicleUseCase', () => {
  let useCase: CreateVehicleUseCase;
  let vehicleRepository: jest.Mocked<VehicleRepository>;
  let redisPositionRepository: jest.Mocked<RedisVehiclePositionRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateVehicleUseCase,
        {
          provide: VehicleRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: RedisVehiclePositionRepository,
          useValue: {
            savePosition: jest.fn(),
            getPosition: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<CreateVehicleUseCase>(CreateVehicleUseCase);
    vehicleRepository = module.get(VehicleRepository);
    redisPositionRepository = module.get(RedisVehiclePositionRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute() - AMR Creation', () => {
    it('should create an AMR vehicle', async () => {
      const dto: CreateVehicleDto = {
        name: 'AMR-001',
        type: VehicleType.AMR,
        manufacturer: 'Test Corp',
        model: 'AMR-X100',
        specification: {
          maxSpeed: 2.5,
          maxLoad: 500,
          batteryCapacity: 100,
          dimensions: { length: 1.5, width: 0.8, height: 1.2 },
          weight: 200,
        },
        amrSpecific: {
          lidarEnabled: true,
          cameraEnabled: true,
          ultrasonicEnabled: false,
          autonomyLevel: 3,
          mapId: 'map-factory-1',
          obstacleAvoidanceConfig: {
            enabled: true,
            minDistance: 0.5,
            detectionAngle: 180,
            avoidanceStrategy: 'STOP',
          },
        },
      };

      vehicleRepository.create.mockImplementation((vehicle) =>
        Promise.resolve(vehicle),
      );

      const result = await useCase.execute(dto);

      expect(result).toBeInstanceOf(AMR);
      expect(result.name).toBe('AMR-001');
      expect(result.type).toBe(VehicleType.AMR);
      expect((result as AMR).lidarEnabled).toBe(true);
      expect((result as AMR).autonomyLevel).toBe(3);
      expect(vehicleRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should throw error if AMR specific data is missing', async () => {
      const dto: CreateVehicleDto = {
        name: 'AMR-001',
        type: VehicleType.AMR,
        manufacturer: 'Test Corp',
        specification: {
          maxSpeed: 2.5,
          maxLoad: 500,
          batteryCapacity: 100,
        },
        // amrSpecific is missing
      };

      await expect(useCase.execute(dto)).rejects.toThrow(
        'AMR specific data is required',
      );
      expect(vehicleRepository.create).not.toHaveBeenCalled();
    });

    it('should generate unique UUID for each vehicle', async () => {
      const dto: CreateVehicleDto = {
        name: 'AMR-001',
        type: VehicleType.AMR,
        manufacturer: 'Test Corp',
        specification: {
          maxSpeed: 2.5,
          maxLoad: 500,
          batteryCapacity: 100,
        },
        amrSpecific: {
          lidarEnabled: true,
          cameraEnabled: true,
          ultrasonicEnabled: false,
          autonomyLevel: 3,
          obstacleAvoidanceConfig: {
            enabled: true,
            minDistance: 0.5,
            detectionAngle: 180,
            avoidanceStrategy: 'STOP',
          },
        },
      };

      vehicleRepository.create.mockImplementation((vehicle) =>
        Promise.resolve(vehicle),
      );

      const result1 = await useCase.execute(dto);
      const result2 = await useCase.execute(dto);

      expect(result1.id).not.toBe(result2.id);
      expect(result1.id).toBeDefined();
      expect(result2.id).toBeDefined();
    });
  });

  describe('execute() - AGV Creation', () => {
    it('should create an AGV vehicle', async () => {
      const dto: CreateVehicleDto = {
        name: 'AGV-001',
        type: VehicleType.AGV,
        manufacturer: 'AGV Systems',
        model: 'AGV-P200',
        specification: {
          maxSpeed: 2.0,
          maxLoad: 800,
          batteryCapacity: 80,
        },
        agvSpecific: {
          guideType: GuideType.MAGNETIC,
          lineFollowingConfig: {
            sensitivity: 0.8,
            maxDeviation: 0.1,
            correctionSpeed: 0.5,
          },
          loadType: 'pallet',
          maxLoadWeight: 800,
        },
      };

      vehicleRepository.create.mockImplementation((vehicle) =>
        Promise.resolve(vehicle),
      );

      const result = await useCase.execute(dto);

      expect(result).toBeInstanceOf(AGV);
      expect(result.name).toBe('AGV-001');
      expect(result.type).toBe(VehicleType.AGV);
      expect((result as AGV).guideType).toBe(GuideType.MAGNETIC);
      expect((result as AGV).maxLoadWeight).toBe(800);
      expect(vehicleRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should throw error if AGV specific data is missing', async () => {
      const dto: CreateVehicleDto = {
        name: 'AGV-001',
        type: VehicleType.AGV,
        manufacturer: 'AGV Systems',
        specification: {
          maxSpeed: 2.0,
          maxLoad: 800,
          batteryCapacity: 80,
        },
        // agvSpecific is missing
      };

      await expect(useCase.execute(dto)).rejects.toThrow(
        'AGV specific data is required',
      );
      expect(vehicleRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('execute() - OHT Creation', () => {
    it('should create an OHT vehicle', async () => {
      const dto: CreateVehicleDto = {
        name: 'OHT-001',
        type: VehicleType.OHT,
        manufacturer: 'OHT Tech',
        model: 'OHT-H500',
        specification: {
          maxSpeed: 5.0,
          maxLoad: 1500,
          batteryCapacity: 200,
        },
        ohtSpecific: {
          railId: 'rail-main',
          railSegments: [
            { id: 'segment-1', startPosition: 0, endPosition: 100, name: 'Main' },
            { id: 'segment-2', startPosition: 100, endPosition: 200 },
          ],
        },
      };

      vehicleRepository.create.mockImplementation((vehicle) =>
        Promise.resolve(vehicle),
      );

      const result = await useCase.execute(dto);

      expect(result).toBeInstanceOf(OHT);
      expect(result.name).toBe('OHT-001');
      expect(result.type).toBe(VehicleType.OHT);
      expect((result as OHT).railId).toBe('rail-main');
      expect((result as OHT).railSegments).toHaveLength(2);
      expect(vehicleRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should throw error if OHT specific data is missing', async () => {
      const dto: CreateVehicleDto = {
        name: 'OHT-001',
        type: VehicleType.OHT,
        manufacturer: 'OHT Tech',
        specification: {
          maxSpeed: 5.0,
          maxLoad: 1500,
          batteryCapacity: 200,
        },
        // ohtSpecific is missing
      };

      await expect(useCase.execute(dto)).rejects.toThrow(
        'OHT specific data is required',
      );
      expect(vehicleRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('execute() - Error Handling', () => {
    it('should throw error for unsupported vehicle type', async () => {
      const dto: CreateVehicleDto = {
        name: 'UNKNOWN-001',
        type: 'FORKLIFT' as any, // Unsupported type
        manufacturer: 'Test',
        specification: {
          maxSpeed: 2.0,
          maxLoad: 500,
          batteryCapacity: 100,
        },
      };

      await expect(useCase.execute(dto)).rejects.toThrow(
        'Unsupported vehicle type: FORKLIFT',
      );
      expect(vehicleRepository.create).not.toHaveBeenCalled();
    });

    it('should propagate domain validation errors', async () => {
      const dto: CreateVehicleDto = {
        name: 'AMR-INVALID',
        type: VehicleType.AMR,
        manufacturer: 'Test',
        specification: {
          maxSpeed: -1, // Invalid: negative speed
          maxLoad: 500,
          batteryCapacity: 100,
        },
        amrSpecific: {
          lidarEnabled: true,
          cameraEnabled: true,
          ultrasonicEnabled: false,
          autonomyLevel: 3,
          obstacleAvoidanceConfig: {
            enabled: true,
            minDistance: 0.5,
            detectionAngle: 180,
            avoidanceStrategy: 'STOP',
          },
        },
      };

      await expect(useCase.execute(dto)).rejects.toThrow(
        'Max speed must be greater than 0',
      );
      expect(vehicleRepository.create).not.toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
      const dto: CreateVehicleDto = {
        name: 'AMR-001',
        type: VehicleType.AMR,
        manufacturer: 'Test',
        specification: {
          maxSpeed: 2.5,
          maxLoad: 500,
          batteryCapacity: 100,
        },
        amrSpecific: {
          lidarEnabled: true,
          cameraEnabled: true,
          ultrasonicEnabled: false,
          autonomyLevel: 3,
          obstacleAvoidanceConfig: {
            enabled: true,
            minDistance: 0.5,
            detectionAngle: 180,
            avoidanceStrategy: 'STOP',
          },
        },
      };

      vehicleRepository.create.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(useCase.execute(dto)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('execute() - Specification Validation', () => {
    it('should validate manufacturer creation', async () => {
      const dto: CreateVehicleDto = {
        name: 'AMR-001',
        type: VehicleType.AMR,
        manufacturer: 'Valid Manufacturer',
        specification: {
          maxSpeed: 2.5,
          maxLoad: 500,
          batteryCapacity: 100,
        },
        amrSpecific: {
          lidarEnabled: true,
          cameraEnabled: true,
          ultrasonicEnabled: false,
          autonomyLevel: 3,
          obstacleAvoidanceConfig: {
            enabled: true,
            minDistance: 0.5,
            detectionAngle: 180,
            avoidanceStrategy: 'STOP',
          },
        },
      };

      vehicleRepository.create.mockImplementation((vehicle) =>
        Promise.resolve(vehicle),
      );

      const result = await useCase.execute(dto);

      expect(result.manufacturer.name).toBe('Valid Manufacturer');
    });

    it('should handle optional model field', async () => {
      const dto: CreateVehicleDto = {
        name: 'AMR-001',
        type: VehicleType.AMR,
        manufacturer: 'Test',
        // model is omitted
        specification: {
          maxSpeed: 2.5,
          maxLoad: 500,
          batteryCapacity: 100,
        },
        amrSpecific: {
          lidarEnabled: true,
          cameraEnabled: true,
          ultrasonicEnabled: false,
          autonomyLevel: 3,
          obstacleAvoidanceConfig: {
            enabled: true,
            minDistance: 0.5,
            detectionAngle: 180,
            avoidanceStrategy: 'STOP',
          },
        },
      };

      vehicleRepository.create.mockImplementation((vehicle) =>
        Promise.resolve(vehicle),
      );

      const result = await useCase.execute(dto);

      expect(result.model).toBeUndefined();
    });
  });
});
