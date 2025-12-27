import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { VehicleInterface } from './vehicle.type';
import { HoistStatus } from '../../../domain/entities/oht.entity';

registerEnumType(HoistStatus, {
  name: 'HoistStatus',
  description: 'The status of the OHT hoist',
});

@ObjectType()
export class RailSegmentType {
  @Field()
  id: string;

  @Field()
  startPosition: number;

  @Field()
  endPosition: number;

  @Field({ nullable: true })
  name?: string;
}

@ObjectType({ implements: () => [VehicleInterface] })
export class OHTType extends VehicleInterface {
  @Field()
  railId: string;

  @Field(() => HoistStatus)
  hoistStatus: HoistStatus;

  @Field()
  railPosition: number;

  @Field(() => [RailSegmentType])
  railSegments: RailSegmentType[];
}
