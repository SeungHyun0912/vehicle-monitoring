import { Field, Int, ObjectType } from '@nestjs/graphql';
import { VehicleInterface } from './vehicle.type';

@ObjectType()
export class ObstacleAvoidanceConfigType {
  @Field()
  enabled: boolean;

  @Field()
  minDistance: number;

  @Field()
  detectionAngle: number;

  @Field()
  avoidanceStrategy: string;
}

@ObjectType({ implements: () => [VehicleInterface] })
export class AMRType extends VehicleInterface {
  @Field()
  lidarEnabled: boolean;

  @Field()
  cameraEnabled: boolean;

  @Field()
  ultrasonicEnabled: boolean;

  @Field(() => Int)
  autonomyLevel: number;

  @Field({ nullable: true })
  mapId?: string;

  @Field(() => ObstacleAvoidanceConfigType)
  obstacleAvoidanceConfig: ObstacleAvoidanceConfigType;
}
