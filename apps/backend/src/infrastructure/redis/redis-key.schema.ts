export class RedisKeySchema {
  static readonly VEHICLE_PREFIX = 'vehicle:';
  static readonly VEHICLES_ACTIVE_SET = 'vehicles:active';
  static readonly VEHICLES_POSITIONS_GEO = 'vehicles:positions';

  static vehiclePosition(vehicleId: string): string {
    return `${this.VEHICLE_PREFIX}${vehicleId}:position`;
  }

  static vehicleState(vehicleId: string): string {
    return `${this.VEHICLE_PREFIX}${vehicleId}:state`;
  }

  static vehicleLastUpdate(vehicleId: string): string {
    return `${this.VEHICLE_PREFIX}${vehicleId}:last_update`;
  }

  static vehicleChannel(vehicleId?: string): string {
    if (vehicleId) {
      return `${this.VEHICLE_PREFIX}${vehicleId}:updates`;
    }
    return `${this.VEHICLE_PREFIX}all:updates`;
  }

  static positionUpdateChannel(): string {
    return 'vehicle:position:update';
  }

  static stateUpdateChannel(): string {
    return 'vehicle:state:update';
  }
}

export interface RedisPositionData {
  x: number;
  y: number;
  z: number;
  qx: number;
  qy: number;
  qz: number;
  qw: number;
  heading: number;
  timestamp: number;
  frame_id?: string;
  mapId?: string;
}

export interface RedisStateData {
  currentSpeed: number;
  batteryLevel: number;
  currentLoad?: number;
  temperature?: number;
  errorCodes?: string[];
  timestamp: number;
}

export interface RedisVehicleUpdate {
  vehicleId: string;
  position?: RedisPositionData;
  state?: RedisStateData;
  timestamp: number;
}
