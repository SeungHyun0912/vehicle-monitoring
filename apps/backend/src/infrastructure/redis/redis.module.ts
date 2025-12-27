import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import redisConfig from '../config/redis.config';

export const REDIS_CLIENT = 'REDIS_CLIENT';
export const REDIS_SUBSCRIBER = 'REDIS_SUBSCRIBER';
export const REDIS_PUBLISHER = 'REDIS_PUBLISHER';

@Global()
@Module({
  imports: [ConfigModule.forFeature(redisConfig)],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService) => {
        const config = configService.get('redis');
        return new Redis({
          host: config.host,
          port: config.port,
          password: config.password,
          db: config.db,
          keyPrefix: config.keyPrefix,
          retryStrategy: config.retryStrategy,
          maxRetriesPerRequest: config.maxRetriesPerRequest,
          enableReadyCheck: config.enableReadyCheck,
          enableOfflineQueue: config.enableOfflineQueue,
        });
      },
      inject: [ConfigService],
    },
    {
      provide: REDIS_SUBSCRIBER,
      useFactory: (configService: ConfigService) => {
        const config = configService.get('redis');
        return new Redis({
          host: config.host,
          port: config.port,
          password: config.password,
          db: config.db,
          enableReadyCheck: config.enableReadyCheck,
        });
      },
      inject: [ConfigService],
    },
    {
      provide: REDIS_PUBLISHER,
      useFactory: (configService: ConfigService) => {
        const config = configService.get('redis');
        return new Redis({
          host: config.host,
          port: config.port,
          password: config.password,
          db: config.db,
          enableReadyCheck: config.enableReadyCheck,
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CLIENT, REDIS_SUBSCRIBER, REDIS_PUBLISHER],
})
export class RedisModule {}
