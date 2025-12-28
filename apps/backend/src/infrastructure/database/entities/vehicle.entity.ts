import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  TableInheritance,
} from 'typeorm';
import { VehicleStatus, VehicleType } from '../../../domain/value-objects';

@Entity('vehicles')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class VehicleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: VehicleType,
  })
  type: VehicleType;

  @Column({ type: 'varchar', length: 255 })
  manufacturer: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  model?: string;

  @Column({
    type: 'enum',
    enum: VehicleStatus,
    default: VehicleStatus.IDLE,
  })
  status: VehicleStatus;

  @Column({ type: 'boolean', default: false })
  isEnabled: boolean;

  @Column({ type: 'jsonb' })
  specification: {
    maxSpeed: number;
    maxLoad: number;
    batteryCapacity: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    weight?: number;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
