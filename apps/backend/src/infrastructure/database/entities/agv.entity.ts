import { ChildEntity, Column } from 'typeorm';
import { VehicleEntity } from './vehicle.entity';
import { VehicleType } from '../../../domain/value-objects';
import { GuideType } from '../../../domain/entities/agv.entity';

@ChildEntity(VehicleType.AGV)
export class AGVEntity extends VehicleEntity {
  @Column({
    type: 'enum',
    enum: GuideType,
  })
  guideType: GuideType;

  @Column({ type: 'jsonb' })
  lineFollowingConfig: {
    sensitivity: number;
    maxDeviation: number;
    correctionSpeed: number;
  };

  @Column({ type: 'varchar', length: 255 })
  loadType: string;

  @Column({ type: 'float' })
  maxLoadWeight: number;
}
