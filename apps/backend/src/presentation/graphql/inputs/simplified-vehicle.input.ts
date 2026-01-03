import { Field, InputType } from '@nestjs/graphql';
import { VehicleType, VehicleStatus } from '../../../domain/value-objects';
import { GuideType } from '../../../domain/entities/agv.entity';
import { HoistStatus } from '../../../domain/entities/oht.entity';
import { IsNotEmpty, IsOptional, IsEnum, Min } from 'class-validator';

/**
 * Simplified input for creating vehicles from the frontend.
 * This provides a flat structure that matches what the frontend sends,
 * making it easier to work with compared to the complex nested CreateVehicleInput.
 */
@InputType()
export class SimplifiedCreateVehicleInput {
  @Field()
  @IsNotEmpty()
  name: string;

  @Field(() => VehicleType)
  @IsEnum(VehicleType)
  type: VehicleType;

  @Field(() => VehicleStatus, { nullable: true, defaultValue: VehicleStatus.IDLE })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus = VehicleStatus.IDLE;

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  isEnabled?: boolean = true;

  // AMR specific fields (optional)
  @Field({ nullable: true })
  @IsOptional()
  @Min(0)
  maxSpeed?: number;

  @Field({ nullable: true })
  @IsOptional()
  @Min(0)
  batteryCapacity?: number;

  // AGV specific fields (optional)
  @Field(() => GuideType, { nullable: true })
  @IsOptional()
  @IsEnum(GuideType)
  guideType?: GuideType;

  @Field({ nullable: true })
  @IsOptional()
  @Min(0)
  loadCapacity?: number;

  // OHT specific fields (optional)
  @Field(() => HoistStatus, { nullable: true })
  @IsOptional()
  @IsEnum(HoistStatus)
  hoistStatus?: HoistStatus;

  @Field({ nullable: true })
  @IsOptional()
  trackId?: string;
}

/**
 * Simplified input for updating vehicles from the frontend.
 * All fields are optional to allow partial updates.
 */
@InputType()
export class SimplifiedUpdateVehicleInput {
  @Field({ nullable: true })
  @IsOptional()
  name?: string;

  @Field(() => VehicleStatus, { nullable: true })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @Field({ nullable: true })
  @IsOptional()
  isEnabled?: boolean;

  // AMR specific fields
  @Field({ nullable: true })
  @IsOptional()
  @Min(0)
  maxSpeed?: number;

  @Field({ nullable: true })
  @IsOptional()
  @Min(0)
  batteryCapacity?: number;

  // AGV specific fields
  @Field(() => GuideType, { nullable: true })
  @IsOptional()
  @IsEnum(GuideType)
  guideType?: GuideType;

  @Field({ nullable: true })
  @IsOptional()
  @Min(0)
  loadCapacity?: number;

  // OHT specific fields
  @Field(() => HoistStatus, { nullable: true })
  @IsOptional()
  @IsEnum(HoistStatus)
  hoistStatus?: HoistStatus;

  @Field({ nullable: true })
  @IsOptional()
  trackId?: string;
}
