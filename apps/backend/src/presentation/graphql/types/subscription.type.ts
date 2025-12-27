import { Field, ID, ObjectType } from '@nestjs/graphql';
import { VehiclePositionType } from './vehicle-position.type';
import { VehicleRuntimeStateType } from './vehicle-runtime-state.type';
import { VehicleStatus } from '../../../domain/value-objects';

@ObjectType()
export class VehiclePositionUpdateType {
  @Field(() => ID)
  vehicleId: string;

  @Field(() => VehiclePositionType)
  position: VehiclePositionType;

  @Field(() => VehicleRuntimeStateType)
  state: VehicleRuntimeStateType;
}

@ObjectType()
export class VehicleStateChangeType {
  @Field(() => ID)
  vehicleId: string;

  @Field(() => VehicleStatus)
  oldStatus: VehicleStatus;

  @Field(() => VehicleStatus)
  newStatus: VehicleStatus;

  @Field()
  timestamp: Date;
}

@ObjectType()
export class VehicleErrorType {
  @Field(() => ID)
  vehicleId: string;

  @Field()
  errorCode: string;

  @Field()
  message: string;

  @Field()
  timestamp: Date;
}
