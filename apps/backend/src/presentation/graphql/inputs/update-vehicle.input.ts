import { Field, InputType } from '@nestjs/graphql';
import { VehicleStatus } from '../../../domain/value-objects';
import { VehicleSpecificationInput } from './vehicle.input';
import { IsOptional, IsEnum } from 'class-validator';

@InputType()
export class UpdateVehicleInput {
  @Field({ nullable: true })
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  model?: string;

  @Field(() => VehicleStatus, { nullable: true })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @Field(() => VehicleSpecificationInput, { nullable: true })
  @IsOptional()
  specification?: VehicleSpecificationInput;
}
