import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { IVehicleRepository, VehicleFilter } from '../../../domain/repositories/vehicle.repository.interface';
import { Vehicle } from '../../../domain/entities/vehicle.entity';
import { VehicleEntity } from '../entities/vehicle.entity';
import { VehicleMapper } from '../mappers/vehicle.mapper';
import { VehicleType } from '../../../domain/value-objects';

@Injectable()
export class VehicleRepository implements IVehicleRepository {
  constructor(
    @InjectRepository(VehicleEntity)
    private readonly repository: Repository<VehicleEntity>,
  ) {}

  async findById(id: string): Promise<Vehicle | null> {
    const entity = await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    return entity ? VehicleMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<Vehicle[]> {
    const entities = await this.repository.find({
      where: { deletedAt: IsNull() },
    });
    return entities.map((entity) => VehicleMapper.toDomain(entity));
  }

  async findByType(type: VehicleType): Promise<Vehicle[]> {
    const entities = await this.repository.find({
      where: { type, deletedAt: IsNull() },
    });
    return entities.map((entity) => VehicleMapper.toDomain(entity));
  }

  async findEnabledVehicles(): Promise<Vehicle[]> {
    const entities = await this.repository.find({
      where: { isEnabled: true, deletedAt: IsNull() },
    });
    return entities.map((entity) => VehicleMapper.toDomain(entity));
  }

  async findByFilter(filter: VehicleFilter): Promise<Vehicle[]> {
    const where: any = { deletedAt: IsNull() };

    if (filter.type) {
      where.type = filter.type;
    }
    if (filter.status) {
      where.status = filter.status;
    }
    if (filter.isEnabled !== undefined) {
      where.isEnabled = filter.isEnabled;
    }
    if (filter.manufacturerName) {
      where.manufacturer = filter.manufacturerName;
    }

    const entities = await this.repository.find({ where });
    return entities.map((entity) => VehicleMapper.toDomain(entity));
  }

  async create(vehicle: Vehicle): Promise<Vehicle> {
    const entity = VehicleMapper.toEntity(vehicle);
    const saved = await this.repository.save(entity);
    return VehicleMapper.toDomain(saved);
  }

  async update(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
    const existing = await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!existing) {
      throw new Error(`Vehicle with id ${id} not found`);
    }

    // Convert domain vehicle to entity for update
    const fullVehicle = VehicleMapper.toDomain(existing);
    Object.assign(fullVehicle, vehicle);
    const entityToSave = VehicleMapper.toEntity(fullVehicle);

    const saved = await this.repository.save(entityToSave);
    return VehicleMapper.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.softDelete(id);
  }

  async enable(id: string): Promise<Vehicle> {
    const vehicle = await this.findById(id);
    if (!vehicle) {
      throw new Error(`Vehicle with id ${id} not found`);
    }
    vehicle.enable();
    return this.update(id, vehicle);
  }

  async disable(id: string): Promise<Vehicle> {
    const vehicle = await this.findById(id);
    if (!vehicle) {
      throw new Error(`Vehicle with id ${id} not found`);
    }
    vehicle.disable();
    return this.update(id, vehicle);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async findByIdIncludingDeleted(id: string): Promise<Vehicle | null> {
    const entity = await this.repository.findOne({
      where: { id },
      withDeleted: true,
    });
    return entity ? VehicleMapper.toDomain(entity) : null;
  }
}
