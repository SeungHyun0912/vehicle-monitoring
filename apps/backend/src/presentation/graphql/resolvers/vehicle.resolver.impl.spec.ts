import { Test, TestingModule } from '@nestjs/testing';
import { VehicleResolverImpl } from './vehicle.resolver.impl';
import {
  CreateVehicleUseCase,
  GetVehicleUseCase,
  GetVehiclesUseCase,
  EnableVehicleUseCase,
  GetVehiclePositionUseCase,
} from '../../../application/use-cases/vehicle';
import { VehicleRepository } from '../../../infrastructure/database/repositories/vehicle.repository';
import { RedisVehicleStateRepository } from '../../../infrastructure/redis/repositories/redis-vehicle-state.repository';
import { VehicleType, VehicleStatus, Manufacturer, VehicleSpecification, Dimensions } from '../../../domain/value-objects';
import { AMR } from '../../../domain/entities/amr.entity';
import { AGV, GuideType } from '../../../domain/entities/agv.entity';

describe('VehicleResolverImpl', () => {
  let resolver: VehicleResolverImpl;
  let createVehicleUseCase: jest.Mocked<CreateVehicleUseCase>;
  let getVehicleUseCase: jest.Mocked<GetVehicleUseCase>;
  let getVehiclesUseCase: jest.Mocked<GetVehiclesUseCase>;
  let enableVehicleUseCase: jest.Mocked<EnableVehicleUseCase>;
  let getVehiclePositionUseCase: jest.Mocked<GetVehiclePositionUseCase>;
  let vehicleRepository: jest.Mocked<VehicleRepository>;
  let redisStateRepository: jest.Mocked<RedisVehicleStateRepository>;

  const createMockAMR = (): AMR => {
    const manufacturer = new Manufacturer('Test Corp');
    const specification = new VehicleSpecification(
      2.5,
      500,
      100,
      new Dimensions(1.5, 0.8, 1.2),
      200,
    );
    return new AMR(
      'amr-test-123',
      'AMR-001',
      manufacturer,
      specification,
      true,
      true,
      false,
      3,
      {
        enabled: true,
        minDistance: 0.5,
        detectionAngle: 180,
        avoidanceStrategy: 'STOP',
      },
      'AMR-X100',
      'map-1',
    );
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleResolverImpl,
        {
          provide: CreateVehicleUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetVehicleUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetVehiclesUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: EnableVehicleUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetVehiclePositionUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: VehicleRepository,
          useValue: {
            findByType: jest.fn(),
            findEnabledVehicles: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            disable: jest.fn(),
          },
        },
        {
          provide: RedisVehicleStateRepository,
          useValue: {
            getState: jest.fn(),
            setState: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<VehicleResolverImpl>(VehicleResolverImpl);
    createVehicleUseCase = module.get(CreateVehicleUseCase);
    getVehicleUseCase = module.get(GetVehicleUseCase);
    getVehiclesUseCase = module.get(GetVehiclesUseCase);
    enableVehicleUseCase = module.get(EnableVehicleUseCase);
    getVehiclePositionUseCase = module.get(GetVehiclePositionUseCase);
    vehicleRepository = module.get(VehicleRepository);
    redisStateRepository = module.get(RedisVehicleStateRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getVehicles()', () => {
    it('should return all vehicles', async () => {
      const mockVehicles = [createMockAMR()];
      getVehiclesUseCase.execute.mockResolvedValue(mockVehicles);

      const result = await resolver.getVehicles();

      expect(result).toHaveLength(1);
      expect(getVehiclesUseCase.execute).toHaveBeenCalledWith(undefined);
    });

    it('should return vehicles with filter', async () => {
      const mockVehicles = [createMockAMR()];
      const filter = { type: VehicleType.AMR };
      getVehiclesUseCase.execute.mockResolvedValue(mockVehicles);

      const result = await resolver.getVehicles(filter);

      expect(result).toHaveLength(1);
      expect(getVehiclesUseCase.execute).toHaveBeenCalledWith(filter);
    });

    it('should return empty array when no vehicles', async () => {
      getVehiclesUseCase.execute.mockResolvedValue([]);

      const result = await resolver.getVehicles();

      expect(result).toHaveLength(0);
    });
  });

  describe('getVehicle()', () => {
    it('should return a vehicle by ID', async () => {
      const mockVehicle = createMockAMR();
      getVehicleUseCase.execute.mockResolvedValue(mockVehicle);

      const result = await resolver.getVehicle('amr-test-123');

      expect(result).toBeDefined();
      expect(getVehicleUseCase.execute).toHaveBeenCalledWith('amr-test-123');
    });

    it('should return null when vehicle not found', async () => {
      getVehicleUseCase.execute.mockResolvedValue(null);

      const result = await resolver.getVehicle('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('getVehiclesByType()', () => {
    it('should return vehicles by type', async () => {
      const mockVehicles = [createMockAMR()];
      vehicleRepository.findByType.mockResolvedValue(mockVehicles);

      const result = await resolver.getVehiclesByType(VehicleType.AMR);

      expect(result).toHaveLength(1);
      expect(vehicleRepository.findByType).toHaveBeenCalledWith(VehicleType.AMR);
    });

    it('should return empty array for type with no vehicles', async () => {
      vehicleRepository.findByType.mockResolvedValue([]);

      const result = await resolver.getVehiclesByType(VehicleType.OHT);

      expect(result).toHaveLength(0);
    });
  });

  describe('getEnabledVehicles()', () => {
    it('should return only enabled vehicles', async () => {
      const mockVehicle = createMockAMR();
      mockVehicle.enable();
      vehicleRepository.findEnabledVehicles.mockResolvedValue([mockVehicle]);

      const result = await resolver.getEnabledVehicles();

      expect(result).toHaveLength(1);
      expect(vehicleRepository.findEnabledVehicles).toHaveBeenCalled();
    });
  });

  describe('createVehicleSimplified()', () => {
    it('should create a vehicle with simplified input', async () => {
      const mockVehicle = createMockAMR();
      createVehicleUseCase.execute.mockResolvedValue(mockVehicle);
      vehicleRepository.update.mockResolvedValue(mockVehicle);

      const input = {
        name: 'AMR-001',
        type: VehicleType.AMR,
        status: VehicleStatus.IDLE,
        isEnabled: true,
        maxSpeed: 2.5,
        batteryCapacity: 100,
      };

      const result = await resolver.createVehicleSimplified(input);

      expect(result).toBeDefined();
      expect(createVehicleUseCase.execute).toHaveBeenCalled();
    });

    it('should set initial status when provided', async () => {
      const mockVehicle = createMockAMR();
      createVehicleUseCase.execute.mockResolvedValue(mockVehicle);
      vehicleRepository.update.mockResolvedValue(mockVehicle);

      const input = {
        name: 'AMR-001',
        type: VehicleType.AMR,
        status: VehicleStatus.CHARGING,
        isEnabled: true,
        maxSpeed: 2.5,
        batteryCapacity: 100,
      };

      await resolver.createVehicleSimplified(input);

      expect(mockVehicle.status).toBe(VehicleStatus.CHARGING);
    });

    it('should disable vehicle if isEnabled is false', async () => {
      const mockVehicle = createMockAMR();
      createVehicleUseCase.execute.mockResolvedValue(mockVehicle);
      vehicleRepository.update.mockResolvedValue(mockVehicle);

      const input = {
        name: 'AMR-001',
        type: VehicleType.AMR,
        isEnabled: false,
        maxSpeed: 2.5,
        batteryCapacity: 100,
      };

      await resolver.createVehicleSimplified(input);

      expect(mockVehicle.isEnabled).toBe(false);
    });
  });

  describe('updateVehicleSimplified()', () => {
    it('should update vehicle with simplified input', async () => {
      const mockVehicle = createMockAMR();
      getVehicleUseCase.execute.mockResolvedValue(mockVehicle);
      vehicleRepository.update.mockResolvedValue(mockVehicle);

      const input = {
        name: 'AMR-001-Updated',
        maxSpeed: 3.0,
      };

      const result = await resolver.updateVehicleSimplified('amr-test-123', input);

      expect(result).toBeDefined();
      expect(getVehicleUseCase.execute).toHaveBeenCalledWith('amr-test-123');
      expect(vehicleRepository.update).toHaveBeenCalled();
    });

    it('should throw error if vehicle not found', async () => {
      getVehicleUseCase.execute.mockResolvedValue(null);

      const input = {
        name: 'Updated Name',
      };

      await expect(
        resolver.updateVehicleSimplified('non-existent', input),
      ).rejects.toThrow('Vehicle with id non-existent not found');
    });

    it('should update status when provided', async () => {
      const mockVehicle = createMockAMR();
      getVehicleUseCase.execute.mockResolvedValue(mockVehicle);
      vehicleRepository.update.mockResolvedValue(mockVehicle);

      const input = {
        status: VehicleStatus.MOVING,
      };

      await resolver.updateVehicleSimplified('amr-test-123', input);

      expect(mockVehicle.status).toBe(VehicleStatus.MOVING);
    });

    it('should enable vehicle when isEnabled is true', async () => {
      const mockVehicle = createMockAMR();
      mockVehicle.disable();
      getVehicleUseCase.execute.mockResolvedValue(mockVehicle);
      vehicleRepository.update.mockResolvedValue(mockVehicle);

      const input = {
        isEnabled: true,
      };

      await resolver.updateVehicleSimplified('amr-test-123', input);

      expect(mockVehicle.isEnabled).toBe(true);
    });

    it('should disable vehicle when isEnabled is false', async () => {
      const mockVehicle = createMockAMR();
      mockVehicle.enable();
      getVehicleUseCase.execute.mockResolvedValue(mockVehicle);
      vehicleRepository.update.mockResolvedValue(mockVehicle);

      const input = {
        isEnabled: false,
      };

      await resolver.updateVehicleSimplified('amr-test-123', input);

      expect(mockVehicle.isEnabled).toBe(false);
    });
  });

  describe('deleteVehicle()', () => {
    it('should delete a vehicle', async () => {
      vehicleRepository.delete.mockResolvedValue(undefined);

      const result = await resolver.deleteVehicle('amr-test-123');

      expect(result).toBe(true);
      expect(vehicleRepository.delete).toHaveBeenCalledWith('amr-test-123');
    });
  });

  describe('enableVehicle()', () => {
    it('should enable a vehicle', async () => {
      const mockVehicle = createMockAMR();
      enableVehicleUseCase.execute.mockResolvedValue(mockVehicle);

      const result = await resolver.enableVehicle('amr-test-123');

      expect(result).toBeDefined();
      expect(enableVehicleUseCase.execute).toHaveBeenCalledWith('amr-test-123');
    });
  });

  describe('disableVehicle()', () => {
    it('should disable a vehicle', async () => {
      const mockVehicle = createMockAMR();
      vehicleRepository.disable.mockResolvedValue(mockVehicle);

      const result = await resolver.disableVehicle('amr-test-123');

      expect(result).toBeDefined();
      expect(vehicleRepository.disable).toHaveBeenCalledWith('amr-test-123');
    });
  });

  describe('updateVehicleStatus()', () => {
    it('should update vehicle status', async () => {
      const mockVehicle = createMockAMR();
      getVehicleUseCase.execute.mockResolvedValue(mockVehicle);
      vehicleRepository.update.mockResolvedValue(mockVehicle);

      const result = await resolver.updateVehicleStatus(
        'amr-test-123',
        VehicleStatus.CHARGING,
      );

      expect(result).toBeDefined();
      expect(mockVehicle.status).toBe(VehicleStatus.CHARGING);
      expect(vehicleRepository.update).toHaveBeenCalled();
    });

    it('should throw error if vehicle not found', async () => {
      getVehicleUseCase.execute.mockResolvedValue(null);

      await expect(
        resolver.updateVehicleStatus('non-existent', VehicleStatus.IDLE),
      ).rejects.toThrow('Vehicle with id non-existent not found');
    });
  });

  describe('getVehicleRuntimeState()', () => {
    it('should return runtime state from Redis', async () => {
      const mockState = {
        currentSpeed: 2.0,
        batteryLevel: 85,
        temperature: 35,
        errorCodes: [],
        toJSON: () => ({
          currentSpeed: 2.0,
          batteryLevel: 85,
          temperature: 35,
          errorCodes: [],
        }),
      };

      redisStateRepository.getState.mockResolvedValue(mockState as any);

      const result = await resolver.getVehicleRuntimeState('amr-test-123');

      expect(result).toBeDefined();
      expect(result?.currentSpeed).toBe(2.0);
      expect(result?.batteryLevel).toBe(85);
    });

    it('should return null when state not found', async () => {
      redisStateRepository.getState.mockResolvedValue(null);

      const result = await resolver.getVehicleRuntimeState('non-existent');

      expect(result).toBeNull();
    });
  });
});
