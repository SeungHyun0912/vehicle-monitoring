import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class VehicleRuntimeStateType {
  @Field()
  currentSpeed: number;

  @Field()
  batteryLevel: number;

  @Field()
  lastUpdateTime: Date;

  @Field({ nullable: true })
  currentLoad?: number;

  @Field({ nullable: true })
  temperature?: number;

  @Field(() => [String], { nullable: true })
  errorCodes?: string[];
}
