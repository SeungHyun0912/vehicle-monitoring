import { Field, InputType, Int } from '@nestjs/graphql';
import { VehicleType } from '../../../domain/value-objects';
import { GuideType } from '../../../domain/entities/agv.entity';
import { VehicleSpecificationInput } from './vehicle.input';
import { IsNotEmpty, IsOptional, Min, Max, IsEnum } from 'class-validator';

@InputType()
export class CreateVehicleInput {
  @Field()
  @IsNotEmpty()
  name: string;

  @Field(() => VehicleType)
  @IsEnum(VehicleType)
  type: VehicleType;

  @Field()
  @IsNotEmpty()
  manufacturer: string;

  @Field({ nullable: true })
  @IsOptional()
  model?: string;

  @Field(() => VehicleSpecificationInput)
  specification: VehicleSpecificationInput;

  @Field(() => AMRSpecificInput, { nullable: true })
  @IsOptional()
  amrSpecific?: AMRSpecificInput;

  @Field(() => AGVSpecificInput, { nullable: true })
  @IsOptional()
  agvSpecific?: AGVSpecificInput;

  @Field(() => OHTSpecificInput, { nullable: true })
  @IsOptional()
  ohtSpecific?: OHTSpecificInput;
}

@InputType()
export class AMRSpecificInput {
  @Field()
  lidarEnabled: boolean;

  @Field()
  cameraEnabled: boolean;

  @Field()
  ultrasonicEnabled: boolean;

  @Field(() => Int)
  @Min(0)
  @Max(5)
  autonomyLevel: number;

  @Field({ nullable: true })
  @IsOptional()
  mapId?: string;

  @Field(() => ObstacleAvoidanceConfigInput)
  obstacleAvoidanceConfig: ObstacleAvoidanceConfigInput;
}

@InputType()
export class ObstacleAvoidanceConfigInput {
  @Field()
  enabled: boolean;

  @Field()
  @Min(0)
  minDistance: number;

  @Field()
  @Min(0)
  @Max(360)
  detectionAngle: number;

  @Field()
  avoidanceStrategy: string;
}

@InputType()
export class AGVSpecificInput {
  @Field(() => GuideType)
  @IsEnum(GuideType)
  guideType: GuideType;

  @Field(() => LineFollowingConfigInput)
  lineFollowingConfig: LineFollowingConfigInput;

  @Field()
  @IsNotEmpty()
  loadType: string;

  @Field()
  @Min(0)
  maxLoadWeight: number;
}

@InputType()
export class LineFollowingConfigInput {
  @Field()
  @Min(0)
  @Max(1)
  sensitivity: number;

  @Field()
  @Min(0)
  maxDeviation: number;

  @Field()
  @Min(0)
  correctionSpeed: number;
}

@InputType()
export class OHTSpecificInput {
  @Field()
  @IsNotEmpty()
  railId: string;

  @Field(() => [RailSegmentInput])
  railSegments: RailSegmentInput[];
}

@InputType()
export class RailSegmentInput {
  @Field()
  @IsNotEmpty()
  id: string;

  @Field()
  startPosition: number;

  @Field()
  endPosition: number;

  @Field({ nullable: true })
  @IsOptional()
  name?: string;
}
