import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleRepository } from '../../infrastructure/database/repositories/vehicle.repository';
import { CreateVehicleUseCase } from '../../application/use-cases/vehicle/create-vehicle.use-case';
import { GetVehicleUseCase } from '../../application/use-cases/vehicle/get-vehicle.use-case';
import { GetVehiclesUseCase } from '../../application/use-cases/vehicle/get-vehicles.use-case';
import { EnableVehicleUseCase } from '../../application/use-cases/vehicle/enable-vehicle.use-case';
import { RedisVehiclePositionRepository } from '../../infrastructure/redis/repositories/redis-vehicle-position.repository';
import { VehicleType, VehicleStatus } from '../../domain/value-objects';
import { GuideType } from '../../domain/entities/agv.entity';

/**
 * Integration tests for Vehicle CRUD operations
 *
 * NOTE: These tests require a running PostgreSQL and Redis instance.
 * They are designed to test the full flow from use case to repository.
 *
 * To run these tests:
 * 1. Ensure PostgreSQL is running on localhost:5432
 * 2. Ensure Redis is running on localhost:6379
 * 3. Run: npm test -- vehicle-crud.integration.spec.ts
 */
describe('Vehicle CRUD Integration Tests', () => {
  let app: INestApplication;
  let vehicleRepository: VehicleRepository;
  let createVehicleUseCase: CreateVehicleUseCase;
  let getVehicleUseCase: GetVehicleUseCase;
  let getVehiclesUseCase: GetVehiclesUseCase;
  let enableVehicleUseCase: EnableVehicleUseCase;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        // TypeORM configuration for test database
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432'),
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_NAME || 'vehicle_monitoring_test',
          entities: [__dirname + '/../../infrastructure/database/entities/*.entity{.ts,.js}'],
          synchronize: true, // Only for testing
          dropSchema: true, // Clean database before each test run
        }),
      ],
      providers: [
        VehicleRepository,
        CreateVehicleUseCase,
        GetVehicleUseCase,
        GetVehiclesUseCase,
        EnableVehicleUseCase,
        {
          provide: RedisVehiclePositionRepository,
          useValue: {
            savePosition: jest.fn(),
            getPosition: jest.fn(),
          },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    vehicleRepository = module.get<VehicleRepository>(VehicleRepository);
    createVehicleUseCase = module.get<CreateVehicleUseCase>(CreateVehicleUseCase);
    getVehicleUseCase = module.get<GetVehicleUseCase>(GetVehicleUseCase);
    getVehiclesUseCase = module.get<GetVehiclesUseCase>(GetVehiclesUseCase);
    enableVehicleUseCase = module.get<EnableVehicleUseCase>(EnableVehicleUseCase);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    // Clean up after each test
    const vehicles = await getVehiclesUseCase.execute();
    for (const vehicle of vehicles) {
      await vehicleRepository.delete(vehicle.id as string);
    }
  });

  describe('AMR CRUD Operations', () => {
    it('should create, read, update, and delete an AMR', async () => {
      // CREATE
      const createDto = {
        name: 'AMR-INTEGRATION-001',
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
            avoidanceStrategy: 'STOP' as const,
          },
        },
      };

      const created = await createVehicleUseCase.execute(createDto);
      expect(created).toBeDefined();
      expect(created.id).toBeDefined();
      expect(created.name).toBe('AMR-INTEGRATION-001');

      // READ
      const retrieved = await getVehicleUseCase.execute(created.id as string);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.name).toBe('AMR-INTEGRATION-001');

      // UPDATE
      const updated = await vehicleRepository.update(created.id as string, {
        name: 'AMR-INTEGRATION-001-UPDATED',
      } as any);
      expect(updated.name).toBe('AMR-INTEGRATION-001-UPDATED');

      // DELETE
      await vehicleRepository.delete(created.id as string);
      const deleted = await getVehicleUseCase.execute(created.id as string);
      expect(deleted).toBeNull();
    });

    it('should enable and disable an AMR', async () => {
      const createDto = {
        name: 'AMR-ENABLE-TEST',
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
            avoidanceStrategy: 'STOP' as const,
          },
        },
      };

      const created = await createVehicleUseCase.execute(createDto);
      expect(created.isEnabled).toBe(false); // Default

      // Enable
      const enabled = await enableVehicleUseCase.execute(created.id as string);
      expect(enabled.isEnabled).toBe(true);

      // Disable
      const disabled = await vehicleRepository.disable(created.id as string);
      expect(disabled.isEnabled).toBe(false);
    });

    it('should update AMR status', async () => {
      const createDto = {
        name: 'AMR-STATUS-TEST',
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
            avoidanceStrategy: 'STOP' as const,
          },
        },
      };

      const created = await createVehicleUseCase.execute(createDto);
      expect(created.status).toBe(VehicleStatus.IDLE);

      created.updateStatus(VehicleStatus.MOVING);
      const updated = await vehicleRepository.update(created.id as string, created);
      expect(updated.status).toBe(VehicleStatus.MOVING);
    });
  });

  describe('AGV CRUD Operations', () => {
    it('should create and retrieve an AGV', async () => {
      const createDto = {
        name: 'AGV-INTEGRATION-001',
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

      const created = await createVehicleUseCase.execute(createDto);
      expect(created).toBeDefined();
      expect(created.type).toBe(VehicleType.AGV);

      const retrieved = await getVehicleUseCase.execute(created.id as string);
      expect(retrieved).toBeDefined();
      expect(retrieved?.type).toBe(VehicleType.AGV);
    });
  });

  describe('OHT CRUD Operations', () => {
    it('should create and retrieve an OHT', async () => {
      const createDto = {
        name: 'OHT-INTEGRATION-001',
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
          ],
        },
      };

      const created = await createVehicleUseCase.execute(createDto);
      expect(created).toBeDefined();
      expect(created.type).toBe(VehicleType.OHT);

      const retrieved = await getVehicleUseCase.execute(created.id as string);
      expect(retrieved).toBeDefined();
      expect(retrieved?.type).toBe(VehicleType.OHT);
    });
  });

  describe('Query Operations', () => {
    beforeEach(async () => {
      // Create test vehicles
      await createVehicleUseCase.execute({
        name: 'AMR-QUERY-001',
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
            avoidanceStrategy: 'STOP' as const,
          },
        },
      });

      await createVehicleUseCase.execute({
        name: 'AGV-QUERY-001',
        type: VehicleType.AGV,
        manufacturer: 'Test',
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
      });
    });

    it('should get all vehicles', async () => {
      const vehicles = await getVehiclesUseCase.execute();
      expect(vehicles.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter vehicles by type', async () => {
      const amrVehicles = await vehicleRepository.findByType(VehicleType.AMR);
      expect(amrVehicles.length).toBeGreaterThanOrEqual(1);
      expect(amrVehicles.every(v => v.type === VehicleType.AMR)).toBe(true);

      const agvVehicles = await vehicleRepository.findByType(VehicleType.AGV);
      expect(agvVehicles.length).toBeGreaterThanOrEqual(1);
      expect(agvVehicles.every(v => v.type === VehicleType.AGV)).toBe(true);
    });

    it('should get only enabled vehicles', async () => {
      // Get all vehicles and enable one
      const vehicles = await getVehiclesUseCase.execute();
      if (vehicles.length > 0) {
        await enableVehicleUseCase.execute(vehicles[0].id as string);
      }

      const enabledVehicles = await vehicleRepository.findEnabledVehicles();
      expect(enabledVehicles.every(v => v.isEnabled)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent vehicle ID', async () => {
      const result = await getVehicleUseCase.execute('non-existent-id');
      expect(result).toBeNull();
    });

    it('should validate domain constraints', async () => {
      const invalidDto = {
        name: 'INVALID-AMR',
        type: VehicleType.AMR,
        manufacturer: 'Test',
        specification: {
          maxSpeed: -1, // Invalid
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
            avoidanceStrategy: 'STOP' as const,
          },
        },
      };

      await expect(createVehicleUseCase.execute(invalidDto)).rejects.toThrow();
    });
  });
});
