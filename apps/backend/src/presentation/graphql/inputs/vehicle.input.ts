import { Field, InputType, Int } from '@nestjs/graphql';
import { VehicleType, VehicleStatus } from '../../../domain/value-objects';
import { GuideType } from '../../../domain/entities/agv.entity';
import { IsNotEmpty, IsOptional, Min, Max, IsEnum } from 'class-validator';

@InputType()
export class VehicleSpecificationInput {
  @Field()
  @Min(0)
  maxSpeed: number;

  @Field()
  @Min(0)
  maxLoad: number;

  @Field()
  @Min(0)
  batteryCapacity: number;

  @Field(() => DimensionsInput, { nullable: true })
  @IsOptional()
  dimensions?: DimensionsInput;

  @Field({ nullable: true })
  @IsOptional()
  @Min(0)
  weight?: number;
}

@InputType()
export class DimensionsInput {
  @Field()
  @Min(0)
  length: number;

  @Field()
  @Min(0)
  width: number;

  @Field()
  @Min(0)
  height: number;
}

@InputType()
export class VehicleFilterInput {
  @Field(() => VehicleType, { nullable: true })
  @IsOptional()
  @IsEnum(VehicleType)
  type?: VehicleType;

  @Field(() => VehicleStatus, { nullable: true })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @Field({ nullable: true })
  @IsOptional()
  isEnabled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  manufacturerName?: string;
}

@InputType()
export class PaginationInput {
  @Field(() => Int, { defaultValue: 0 })
  @Min(0)
  offset: number = 0;

  @Field(() => Int, { defaultValue: 20 })
  @Min(1)
  @Max(100)
  limit: number = 20;
}
