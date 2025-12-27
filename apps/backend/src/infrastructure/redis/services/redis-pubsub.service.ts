import { Injectable, Inject, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_SUBSCRIBER, REDIS_PUBLISHER } from '../redis.module';
import { RedisKeySchema, RedisVehicleUpdate } from '../redis-key.schema';
import { Subject, Observable } from 'rxjs';

export interface VehicleUpdateMessage {
  vehicleId: string;
  position?: any;
  state?: any;
  timestamp: number;
}

@Injectable()
export class RedisPubSubService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisPubSubService.name);
  private readonly positionUpdates$ = new Subject<VehicleUpdateMessage>();
  private readonly stateUpdates$ = new Subject<VehicleUpdateMessage>();
  private isSubscribed = false;

  constructor(
    @Inject(REDIS_SUBSCRIBER)
    private readonly subscriber: Redis,
    @Inject(REDIS_PUBLISHER)
    private readonly publisher: Redis,
  ) {}

  async onModuleInit() {
    await this.initializeSubscriptions();
  }

  async onModuleDestroy() {
    await this.cleanup();
  }

  private async initializeSubscriptions() {
    try {
      this.subscriber.on('message', (channel: string, message: string) => {
        this.handleMessage(channel, message);
      });

      this.subscriber.on('error', (error) => {
        this.logger.error('Redis subscriber error', error);
      });

      await this.subscriber.subscribe(
        RedisKeySchema.positionUpdateChannel(),
        RedisKeySchema.stateUpdateChannel(),
      );

      this.isSubscribed = true;
      this.logger.log('Redis Pub/Sub subscriptions initialized');
    } catch (error) {
      this.logger.error('Failed to initialize subscriptions', error);
      throw error;
    }
  }

  private handleMessage(channel: string, message: string) {
    try {
      const data: RedisVehicleUpdate = JSON.parse(message);

      if (channel === RedisKeySchema.positionUpdateChannel()) {
        this.positionUpdates$.next({
          vehicleId: data.vehicleId,
          position: data.position,
          timestamp: data.timestamp,
        });
      } else if (channel === RedisKeySchema.stateUpdateChannel()) {
        this.stateUpdates$.next({
          vehicleId: data.vehicleId,
          state: data.state,
          timestamp: data.timestamp,
        });
      }
    } catch (error) {
      this.logger.error(
        `Failed to handle message from channel ${channel}`,
        error,
      );
    }
  }

  async publishPositionUpdate(
    vehicleId: string,
    position: any,
  ): Promise<void> {
    try {
      const message: RedisVehicleUpdate = {
        vehicleId,
        position,
        timestamp: Date.now(),
      };

      await this.publisher.publish(
        RedisKeySchema.positionUpdateChannel(),
        JSON.stringify(message),
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish position update for vehicle ${vehicleId}`,
        error,
      );
      throw error;
    }
  }

  async publishStateUpdate(vehicleId: string, state: any): Promise<void> {
    try {
      const message: RedisVehicleUpdate = {
        vehicleId,
        state,
        timestamp: Date.now(),
      };

      await this.publisher.publish(
        RedisKeySchema.stateUpdateChannel(),
        JSON.stringify(message),
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish state update for vehicle ${vehicleId}`,
        error,
      );
      throw error;
    }
  }

  getPositionUpdates$(): Observable<VehicleUpdateMessage> {
    return this.positionUpdates$.asObservable();
  }

  getStateUpdates$(): Observable<VehicleUpdateMessage> {
    return this.stateUpdates$.asObservable();
  }

  async subscribeToVehicle(vehicleId: string): Promise<void> {
    try {
      await this.subscriber.subscribe(RedisKeySchema.vehicleChannel(vehicleId));
      this.logger.log(`Subscribed to updates for vehicle ${vehicleId}`);
    } catch (error) {
      this.logger.error(
        `Failed to subscribe to vehicle ${vehicleId}`,
        error,
      );
      throw error;
    }
  }

  async unsubscribeFromVehicle(vehicleId: string): Promise<void> {
    try {
      await this.subscriber.unsubscribe(
        RedisKeySchema.vehicleChannel(vehicleId),
      );
      this.logger.log(`Unsubscribed from updates for vehicle ${vehicleId}`);
    } catch (error) {
      this.logger.error(
        `Failed to unsubscribe from vehicle ${vehicleId}`,
        error,
      );
      throw error;
    }
  }

  private async cleanup() {
    try {
      if (this.isSubscribed) {
        await this.subscriber.unsubscribe();
        this.isSubscribed = false;
      }
      this.positionUpdates$.complete();
      this.stateUpdates$.complete();
      this.logger.log('Redis Pub/Sub cleanup completed');
    } catch (error) {
      this.logger.error('Failed to cleanup subscriptions', error);
    }
  }
}
