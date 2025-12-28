import { ChildEntity, Column } from 'typeorm';
import { VehicleEntity } from './vehicle.entity';
import { VehicleType } from '../../../domain/value-objects';
import { HoistStatus } from '../../../domain/entities/oht.entity';

@ChildEntity(VehicleType.OHT)
export class OHTEntity extends VehicleEntity {
  @Column({ type: 'varchar', length: 255 })
  railId: string;

  @Column({
    type: 'enum',
    enum: HoistStatus,
    default: HoistStatus.UP,
  })
  hoistStatus: HoistStatus;

  @Column({ type: 'float', default: 0 })
  railPosition: number;

  @Column({ type: 'jsonb' })
  railSegments: Array<{
    id: string;
    startPosition: number;
    endPosition: number;
    name?: string;
  }>;
}
