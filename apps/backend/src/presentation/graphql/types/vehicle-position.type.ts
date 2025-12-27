import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class QuaternionType {
  @Field()
  x: number;

  @Field()
  y: number;

  @Field()
  z: number;

  @Field()
  w: number;
}

@ObjectType()
export class EulerAnglesType {
  @Field()
  roll: number;

  @Field()
  pitch: number;

  @Field()
  yaw: number;
}

@ObjectType()
export class VehiclePositionType {
  @Field()
  x: number;

  @Field()
  y: number;

  @Field()
  z: number;

  @Field()
  heading: number;

  @Field()
  timestamp: Date;

  @Field({ nullable: true })
  mapId?: string;

  @Field(() => QuaternionType, { nullable: true })
  rotation?: QuaternionType;

  @Field(() => EulerAnglesType, { nullable: true })
  euler?: EulerAnglesType;
}
