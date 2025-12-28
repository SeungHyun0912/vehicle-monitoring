import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { VehicleInterface, VehiclePositionType, VehicleRuntimeStateType } from '../types';
import { VehicleFilterInput, CreateVehicleInput, UpdateVehicleInput } from '../inputs';
import { VehicleType, VehicleStatus } from '../../../domain/value-objects';
import {
  CreateVehicleUseCase,
  GetVehicleUseCase,
  GetVehiclesUseCase,
  EnableVehicleUseCase,
  GetVehiclePositionUseCase,
} from '../../../application/use-cases/vehicle';
import { VehicleGraphQLMapper } from '../mappers/vehicle-graphql.mapper';
import { VehicleRepository } from '../../../infrastructure/database/repositories/vehicle.repository';
import { RedisVehicleStateRepository } from '../../../infrastructure/redis/repositories/redis-vehicle-state.repository';

@Resolver(() => VehicleInterface)
export class VehicleResolverImpl {
  constructor(
    private readonly createVehicleUseCase: CreateVehicleUseCase,
    private readonly getVehicleUseCase: GetVehicleUseCase,
    private readonly getVehiclesUseCase: GetVehiclesUseCase,
    private readonly enableVehicleUseCase: EnableVehicleUseCase,
    private readonly getVehiclePositionUseCase: GetVehiclePositionUseCase,
    private readonly vehicleRepository: VehicleRepository,
    private readonly redisStateRepository: RedisVehicleStateRepository,
  ) {}

  @Query(() => [VehicleInterface], {
    name: 'vehicles',
    description: 'Get all vehicles with optional filtering',
  })
  async getVehicles(
    @Args('filter', { type: () => VehicleFilterInput, nullable: true })
    filter?: VehicleFilterInput,
  ): Promise<any[]> {
    const vehicles = await this.getVehiclesUseCase.execute(filter);
    return vehicles.map((v) => VehicleGraphQLMapper.toGraphQL(v));
  }

  @Query(() => VehicleInterface, {
    name: 'vehicle',
    description: 'Get a specific vehicle by ID',
    nullable: true,
  })
  async getVehicle(@Args('id', { type: () => ID }) id: string): Promise<any> {
    const vehicle = await this.getVehicleUseCase.execute(id);
    return vehicle ? VehicleGraphQLMapper.toGraphQL(vehicle) : null;
  }

  @Query(() => VehiclePositionType, {
    name: 'vehiclePosition',
    description: 'Get current position of a vehicle',
    nullable: true,
  })
  async getVehiclePosition(
    @Args('vehicleId', { type: () => ID }) vehicleId: string,
  ): Promise<VehiclePositionType | null> {
    const position = await this.getVehiclePositionUseCase.execute(vehicleId);
    return position ? (position.toJSON() as any) : null;
  }

  @Query(() => VehicleRuntimeStateType, {
    name: 'vehicleRuntimeState',
    description: 'Get current runtime state of a vehicle',
    nullable: true,
  })
  async getVehicleRuntimeState(
    @Args('vehicleId', { type: () => ID }) vehicleId: string,
  ): Promise<VehicleRuntimeStateType | null> {
    const state = await this.redisStateRepository.getState(vehicleId);
    return state ? (state.toJSON() as any) : null;
  }

  @Query(() => [VehicleInterface], {
    name: 'vehiclesByType',
    description: 'Get vehicles by type',
  })
  async getVehiclesByType(
    @Args('type', { type: () => VehicleType }) type: VehicleType,
  ): Promise<any[]> {
    const vehicles = await this.vehicleRepository.findByType(type);
    return vehicles.map((v) => VehicleGraphQLMapper.toGraphQL(v));
  }

  @Query(() => [VehicleInterface], {
    name: 'enabledVehicles',
    description: 'Get all enabled vehicles',
  })
  async getEnabledVehicles(): Promise<any[]> {
    const vehicles = await this.vehicleRepository.findEnabledVehicles();
    return vehicles.map((v) => VehicleGraphQLMapper.toGraphQL(v));
  }

  @Mutation(() => VehicleInterface, {
    name: 'createVehicle',
    description: 'Create a new vehicle',
  })
  async createVehicle(
    @Args('input', { type: () => CreateVehicleInput }) input: CreateVehicleInput,
  ): Promise<any> {
    const vehicle = await this.createVehicleUseCase.execute({
      name: input.name,
      type: input.type,
      manufacturer: input.manufacturer,
      model: input.model,
      specification: input.specification,
      amrSpecific: input.amrSpecific as any,
      agvSpecific: input.agvSpecific as any,
      ohtSpecific: input.ohtSpecific as any,
    });
    return VehicleGraphQLMapper.toGraphQL(vehicle);
  }

  @Mutation(() => VehicleInterface, {
    name: 'updateVehicle',
    description: 'Update an existing vehicle',
  })
  async updateVehicle(
    @Args('id', { type: () => ID }) id: string,
    @Args('input', { type: () => UpdateVehicleInput }) input: UpdateVehicleInput,
  ): Promise<any> {
    const vehicle = await this.vehicleRepository.update(id, input as any);
    return VehicleGraphQLMapper.toGraphQL(vehicle);
  }

  @Mutation(() => Boolean, {
    name: 'deleteVehicle',
    description: 'Soft delete a vehicle',
  })
  async deleteVehicle(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    await this.vehicleRepository.delete(id);
    return true;
  }

  @Mutation(() => VehicleInterface, {
    name: 'enableVehicle',
    description: 'Enable a vehicle',
  })
  async enableVehicle(@Args('id', { type: () => ID }) id: string): Promise<any> {
    const vehicle = await this.enableVehicleUseCase.execute(id);
    return VehicleGraphQLMapper.toGraphQL(vehicle);
  }

  @Mutation(() => VehicleInterface, {
    name: 'disableVehicle',
    description: 'Disable a vehicle',
  })
  async disableVehicle(@Args('id', { type: () => ID }) id: string): Promise<any> {
    const vehicle = await this.vehicleRepository.disable(id);
    return VehicleGraphQLMapper.toGraphQL(vehicle);
  }

  @Mutation(() => VehicleInterface, {
    name: 'updateVehicleStatus',
    description: 'Update vehicle status',
  })
  async updateVehicleStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('status', { type: () => VehicleStatus }) status: VehicleStatus,
  ): Promise<any> {
    const vehicle = await this.getVehicleUseCase.execute(id);
    if (!vehicle) {
      throw new Error(`Vehicle with id ${id} not found`);
    }
    vehicle.updateStatus(status);
    const updated = await this.vehicleRepository.update(id, vehicle);
    return VehicleGraphQLMapper.toGraphQL(updated);
  }
}
