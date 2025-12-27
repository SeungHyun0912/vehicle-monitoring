import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from './presentation/graphql/graphql.module';
import { WebSocketModule } from './presentation/websocket/websocket.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { HealthController } from './infrastructure/health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    RedisModule,
    GraphQLModule,
    WebSocketModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
