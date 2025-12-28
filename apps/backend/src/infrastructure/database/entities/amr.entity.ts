import { ChildEntity, Column } from 'typeorm';
import { VehicleEntity } from './vehicle.entity';
import { VehicleType } from '../../../domain/value-objects';

@ChildEntity(VehicleType.AMR)
export class AMREntity extends VehicleEntity {
  @Column({ type: 'boolean', default: false })
  lidarEnabled: boolean;

  @Column({ type: 'boolean', default: false })
  cameraEnabled: boolean;

  @Column({ type: 'boolean', default: false })
  ultrasonicEnabled: boolean;

  @Column({ type: 'int', default: 0 })
  autonomyLevel: number;

  @Column({ type: 'varchar', nullable: true })
  mapId?: string;

  @Column({ type: 'jsonb' })
  obstacleAvoidanceConfig: {
    enabled: boolean;
    minDistance: number;
    detectionAngle: number;
    avoidanceStrategy: string;
  };
}
