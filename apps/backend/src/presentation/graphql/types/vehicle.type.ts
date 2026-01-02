import { Field, ID, InterfaceType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { VehicleType as VehicleTypeEnum, VehicleStatus as VehicleStatusEnum } from '../../../domain/value-objects';

registerEnumType(VehicleTypeEnum, {
  name: 'VehicleType',
  description: 'The type of autonomous vehicle',
});

registerEnumType(VehicleStatusEnum, {
  name: 'VehicleStatus',
  description: 'The current status of the vehicle',
});

@ObjectType()
export class DimensionsType {
  @Field()
  length: number;

  @Field()
  width: number;

  @Field()
  height: number;
}

@ObjectType()
export class VehicleSpecificationType {
  @Field()
  maxSpeed: number;

  @Field()
  maxLoad: number;

  @Field()
  batteryCapacity: number;

  @Field(() => DimensionsType, { nullable: true })
  dimensions?: DimensionsType;

  @Field({ nullable: true })
  weight?: number;
}

@InterfaceType()
export abstract class VehicleInterface {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => VehicleTypeEnum)
  type: VehicleTypeEnum;

  @Field()
  manufacturer: string;

  @Field({ nullable: true })
  model?: string;

  @Field(() => VehicleStatusEnum)
  status: VehicleStatusEnum;

  @Field()
  isEnabled: boolean;

  @Field(() => VehicleSpecificationType)
  specification: VehicleSpecificationType;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  deletedAt?: Date;
}
