import { Module } from '@nestjs/common';
import { GraphQLModule as NestGraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { VehicleResolverImpl } from './resolvers/vehicle.resolver.impl';
import { ApplicationModule } from '../../application/application.module';

@Module({
  imports: [
    ApplicationModule,
    NestGraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      subscriptions: {
        'graphql-ws': true,
        'subscriptions-transport-ws': true,
      },
      context: ({ req, connection }: any) => {
        if (connection) {
          return { req: connection.context };
        }
        return { req };
      },
    }),
  ],
  providers: [VehicleResolverImpl],
  exports: [],
})
export class GraphQLModule {}
