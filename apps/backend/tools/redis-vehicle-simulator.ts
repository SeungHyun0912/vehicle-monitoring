#!/usr/bin/env ts-node

import Redis from 'ioredis';
import { RedisKeySchema } from '../src/infrastructure/redis/redis-key.schema';

interface Position {
  x: number;
  y: number;
  z: number;
}

interface VehicleSimulator {
  vehicleId: string;
  type: 'AMR' | 'AGV' | 'OHT';
  currentPosition: Position;
  targetPosition: Position;
  route: Position[];
  currentRouteIndex: number;
  speed: number;
  batteryLevel: number;
  currentLoad: number;
  temperature: number;
}

class ROS2VehicleSimulator {
  private redisClient: Redis;
  private redisPublisher: Redis;
  private vehicles: Map<string, VehicleSimulator> = new Map();
  private isRunning = false;

  constructor() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0', 10),
    });

    this.redisPublisher = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0', 10),
    });

    this.redisClient.on('connect', () => {
      console.log('✅ Connected to Redis');
    });

    this.redisClient.on('error', (err) => {
      console.error('❌ Redis connection error:', err);
    });
  }

  private generateRoute(type: 'AMR' | 'AGV' | 'OHT'): Position[] {
    switch (type) {
      case 'AMR':
        // Warehouse floor patrol route (rectangular)
        return [
          { x: 0, y: 0, z: 0 },
          { x: 10, y: 0, z: 0 },
          { x: 10, y: 15, z: 0 },
          { x: 0, y: 15, z: 0 },
          { x: 0, y: 0, z: 0 },
        ];

      case 'AGV':
        // Line following route (straight line with return)
        return [
          { x: 0, y: 0, z: 0 },
          { x: 20, y: 0, z: 0 },
          { x: 20, y: 5, z: 0 },
          { x: 0, y: 5, z: 0 },
          { x: 0, y: 0, z: 0 },
        ];

      case 'OHT':
        // Overhead rail route (elevated)
        return [
          { x: 0, y: 0, z: 3 },
          { x: 15, y: 0, z: 3 },
          { x: 15, y: 10, z: 3 },
          { x: 0, y: 10, z: 3 },
          { x: 0, y: 0, z: 3 },
        ];

      default:
        return [{ x: 0, y: 0, z: 0 }];
    }
  }

  createVehicle(vehicleId: string, type: 'AMR' | 'AGV' | 'OHT'): void {
    const route = this.generateRoute(type);
    const speed = type === 'AMR' ? 1.5 : type === 'AGV' ? 1.0 : 2.0;

    const vehicle: VehicleSimulator = {
      vehicleId,
      type,
      currentPosition: { ...route[0] },
      targetPosition: { ...route[1] },
      route,
      currentRouteIndex: 0,
      speed,
      batteryLevel: Math.random() * 30 + 70, // 70-100%
      currentLoad: type === 'AMR' ? 0 : Math.random() * 50,
      temperature: Math.random() * 10 + 30, // 30-40°C
    };

    this.vehicles.set(vehicleId, vehicle);
    console.log(`🤖 Created ${type} vehicle: ${vehicleId}`);
  }

  private calculateHeading(from: Position, to: Position): number {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    return angle;
  }

  private moveTowardsTarget(vehicle: VehicleSimulator, deltaTime: number): void {
    const { currentPosition, targetPosition, speed } = vehicle;

    const dx = targetPosition.x - currentPosition.x;
    const dy = targetPosition.y - currentPosition.y;
    const dz = targetPosition.z - currentPosition.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (distance < 0.1) {
      // Reached target, move to next waypoint
      vehicle.currentRouteIndex =
        (vehicle.currentRouteIndex + 1) % vehicle.route.length;
      vehicle.targetPosition = {
        ...vehicle.route[vehicle.currentRouteIndex],
      };
      console.log(
        `📍 ${vehicle.vehicleId} reached waypoint ${vehicle.currentRouteIndex}`,
      );
    } else {
      // Move towards target
      const moveDistance = speed * deltaTime;
      const ratio = Math.min(moveDistance / distance, 1);

      currentPosition.x += dx * ratio;
      currentPosition.y += dy * ratio;
      currentPosition.z += dz * ratio;
    }
  }

  private updateVehicleState(vehicle: VehicleSimulator): void {
    // Battery drain (0.1% per update)
    vehicle.batteryLevel = Math.max(0, vehicle.batteryLevel - 0.05);

    // Temperature fluctuation
    vehicle.temperature += (Math.random() - 0.5) * 2;
    vehicle.temperature = Math.max(25, Math.min(50, vehicle.temperature));

    // If battery too low, simulate charging
    if (vehicle.batteryLevel < 20) {
      vehicle.batteryLevel = 100;
      console.log(`🔋 ${vehicle.vehicleId} recharged to 100%`);
    }
  }

  private async publishPosition(vehicle: VehicleSimulator): Promise<void> {
    const { currentPosition, targetPosition, vehicleId } = vehicle;

    const heading = this.calculateHeading(currentPosition, targetPosition);

    // Calculate quaternion from heading (simplified 2D rotation)
    const headingRad = (heading * Math.PI) / 180;
    const qz = Math.sin(headingRad / 2);
    const qw = Math.cos(headingRad / 2);

    const positionData = {
      x: currentPosition.x,
      y: currentPosition.y,
      z: currentPosition.z,
      qx: 0,
      qy: 0,
      qz,
      qw,
      heading,
      timestamp: Date.now(),
      frame_id: 'map',
      mapId: 'warehouse-floor-1',
    };

    // Save to Redis
    const key = RedisKeySchema.vehiclePosition(vehicleId);
    await this.redisClient.set(key, JSON.stringify(positionData));

    // Add to active set
    await this.redisClient.sadd(RedisKeySchema.VEHICLES_ACTIVE_SET, vehicleId);

    // Publish update
    const updateMessage = {
      vehicleId,
      position: positionData,
      timestamp: Date.now(),
    };

    await this.redisPublisher.publish(
      RedisKeySchema.positionUpdateChannel(),
      JSON.stringify(updateMessage),
    );
  }

  private async publishState(vehicle: VehicleSimulator): Promise<void> {
    const { vehicleId, speed, batteryLevel, currentLoad, temperature } =
      vehicle;

    const errorCodes: string[] = [];
    if (batteryLevel < 20) errorCodes.push('LOW_BATTERY');
    if (temperature > 45) errorCodes.push('HIGH_TEMPERATURE');

    const stateData = {
      currentSpeed: speed,
      batteryLevel,
      currentLoad,
      temperature,
      errorCodes,
      timestamp: Date.now(),
    };

    // Save to Redis
    const key = RedisKeySchema.vehicleState(vehicleId);
    await this.redisClient.set(key, JSON.stringify(stateData));

    // Publish update
    const updateMessage = {
      vehicleId,
      state: stateData,
      timestamp: Date.now(),
    };

    await this.redisPublisher.publish(
      RedisKeySchema.stateUpdateChannel(),
      JSON.stringify(updateMessage),
    );
  }

  private async updateVehicle(
    vehicle: VehicleSimulator,
    deltaTime: number,
  ): Promise<void> {
    this.moveTowardsTarget(vehicle, deltaTime);
    this.updateVehicleState(vehicle);

    await this.publishPosition(vehicle);
    await this.publishState(vehicle);
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️  Simulator is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting ROS2 Vehicle Simulator...\n');

    const deltaTime = 0.1; // 100ms update interval
    const updateInterval = setInterval(async () => {
      if (!this.isRunning) {
        clearInterval(updateInterval);
        return;
      }

      for (const [vehicleId, vehicle] of this.vehicles) {
        await this.updateVehicle(vehicle, deltaTime);
      }
    }, 100);

    // Status report every 5 seconds
    const statusInterval = setInterval(() => {
      if (!this.isRunning) {
        clearInterval(statusInterval);
        return;
      }

      console.log('\n📊 Vehicle Status Report:');
      for (const [vehicleId, vehicle] of this.vehicles) {
        console.log(
          `  ${vehicleId} (${vehicle.type}): ` +
            `Pos(${vehicle.currentPosition.x.toFixed(2)}, ${vehicle.currentPosition.y.toFixed(2)}, ${vehicle.currentPosition.z.toFixed(2)}) ` +
            `Battery: ${vehicle.batteryLevel.toFixed(1)}% ` +
            `Temp: ${vehicle.temperature.toFixed(1)}°C`,
        );
      }
    }, 5000);
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    console.log('\n🛑 Stopping simulator...');

    // Clean up
    for (const vehicleId of this.vehicles.keys()) {
      await this.redisClient.srem(
        RedisKeySchema.VEHICLES_ACTIVE_SET,
        vehicleId,
      );
    }

    await this.redisClient.quit();
    await this.redisPublisher.quit();
    console.log('✅ Simulator stopped');
  }

  getVehicles(): Map<string, VehicleSimulator> {
    return this.vehicles;
  }
}

// Main execution
async function main() {
  const simulator = new ROS2VehicleSimulator();

  // Create test vehicles
  simulator.createVehicle('amr-001', 'AMR');
  simulator.createVehicle('amr-002', 'AMR');
  simulator.createVehicle('agv-001', 'AGV');
  simulator.createVehicle('oht-001', 'OHT');

  console.log('\n✨ Vehicles created. Starting simulation...\n');

  // Start simulation
  await simulator.start();

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\n🔴 Received SIGINT signal');
    await simulator.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n\n🔴 Received SIGTERM signal');
    await simulator.stop();
    process.exit(0);
  });
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Simulator error:', error);
    process.exit(1);
  });
}

export { ROS2VehicleSimulator, VehicleSimulator };
