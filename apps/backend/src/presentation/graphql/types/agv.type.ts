import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { VehicleInterface } from './vehicle.type';
import { GuideType } from '../../../domain/entities/agv.entity';

registerEnumType(GuideType, {
  name: 'GuideType',
  description: 'The guide type for AGV navigation',
});

@ObjectType()
export class LineFollowingConfigType {
  @Field()
  sensitivity: number;

  @Field()
  maxDeviation: number;

  @Field()
  correctionSpeed: number;
}

@ObjectType({ implements: () => [VehicleInterface] })
export class AGVType extends VehicleInterface {
  @Field(() => GuideType)
  guideType: GuideType;

  @Field(() => LineFollowingConfigType)
  lineFollowingConfig: LineFollowingConfigType;

  @Field()
  loadType: string;

  @Field()
  maxLoadWeight: number;
}
