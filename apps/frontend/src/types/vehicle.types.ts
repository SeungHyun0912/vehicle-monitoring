/**
 * Vehicle Type Enumeration
 */
export enum VehicleType {
  AMR = 'AMR',
  AGV = 'AGV',
  OHT = 'OHT',
  FORKLIFT = 'FORKLIFT',
}

/**
 * Vehicle Status Enumeration
 */
export enum VehicleStatus {
  IDLE = 'IDLE',
  MOVING = 'MOVING',
  CHARGING = 'CHARGING',
  ERROR = 'ERROR',
  STOPPED = 'STOPPED',
  MAINTENANCE = 'MAINTENANCE',
}

/**
 * Position with 3D coordinates and rotation
 */
export interface Position {
  x: number;
  y: number;
  z: number;
  heading: number; // 0-360 degrees
  timestamp: Date;
  mapId?: string;
}

/**
 * Quaternion rotation
 */
export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

/**
 * Euler angles rotation
 */
export interface EulerAngles {
  roll: number;
  pitch: number;
  yaw: number;
}

/**
 * Vehicle Runtime State
 */
export interface VehicleRuntimeState {
  currentSpeed: number;
  batteryLevel: number;
  currentLoad: number;
  temperature: number;
  errorCodes: string[];
  lastUpdateTime: Date;
}

/**
 * Vehicle Specification
 */
export interface VehicleSpecification {
  maxSpeed: number;
  maxLoad: number;
  batteryCapacity: number;
  dimensions?: {
    width: number;
    height: number;
    length: number;
  };
}

/**
 * Base Vehicle Interface
 */
export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  manufacturer: string;
  model?: string;
  status: VehicleStatus;
  isEnabled: boolean;
  specification: VehicleSpecification;
  createdAt: Date;
  updatedAt: Date;

  // Runtime data (from Redis)
  position?: Position;
  runtimeState?: VehicleRuntimeState;
}

/**
 * AMR Specific Configuration
 */
export interface ObstacleAvoidanceConfig {
  enabled: boolean;
  minDistance: number;
  detectionAngle: number;
  avoidanceStrategy: 'STOP' | 'REROUTE' | 'SLOW_DOWN';
}

/**
 * AMR (Autonomous Mobile Robot)
 */
export interface AMR extends Vehicle {
  type: VehicleType.AMR;
  lidarEnabled: boolean;
  cameraEnabled: boolean;
  ultrasonicEnabled: boolean;
  autonomyLevel: number; // 1-5
  mapId?: string;
  obstacleAvoidanceConfig: ObstacleAvoidanceConfig;
}

/**
 * AGV Guide Type
 */
export enum AGVGuideType {
  MAGNETIC = 'MAGNETIC',
  LASER = 'LASER',
  WIRE = 'WIRE',
  VISION = 'VISION',
}

/**
 * AGV Line Following Configuration
 */
export interface LineFollowingConfig {
  sensorCount: number;
  lineWidth: number;
  followingSpeed: number;
}

/**
 * AGV (Automated Guided Vehicle)
 */
export interface AGV extends Vehicle {
  type: VehicleType.AGV;
  guideType: AGVGuideType;
  lineFollowingConfig: LineFollowingConfig;
  loadType: string;
  maxLoadWeight: number;
}

/**
 * OHT Hoist Status
 */
export enum OHTHoistStatus {
  UP = 'UP',
  DOWN = 'DOWN',
  MOVING = 'MOVING',
}

/**
 * OHT (Overhead Hoist Transport)
 */
export interface OHT extends Vehicle {
  type: VehicleType.OHT;
  railId: string;
  hoistStatus: OHTHoistStatus;
  railPosition: number;
  railSegments: string[];
}

/**
 * Union type for all vehicle types
 */
export type AnyVehicle = AMR | AGV | OHT | Vehicle;

/**
 * Vehicle Filter for queries
 */
export interface VehicleFilter {
  type?: VehicleType;
  status?: VehicleStatus;
  isEnabled?: boolean;
  manufacturer?: string;
}

/**
 * WebSocket Message Types
 */
export enum WebSocketMessageType {
  POSITION_UPDATE = 'positionUpdate',
  STATE_CHANGE = 'stateChange',
  ERROR = 'vehicleError',
  SUBSCRIBE_VEHICLE = 'subscribeVehicle',
  UNSUBSCRIBE_VEHICLE = 'unsubscribeVehicle',
  SUBSCRIBE_ALL = 'subscribeAll',
  UNSUBSCRIBE_ALL = 'unsubscribeAll',
}

/**
 * WebSocket Position Update Message
 */
export interface PositionUpdateMessage {
  vehicleId: string;
  position: Position;
  timestamp: number;
}

/**
 * WebSocket State Change Message
 */
export interface StateChangeMessage {
  vehicleId: string;
  state: VehicleRuntimeState;
  timestamp: number;
}

/**
 * WebSocket Error Message
 */
export interface VehicleErrorMessage {
  vehicleId: string;
  errorCode: string;
  message: string;
  timestamp: number;
}

/**
 * WebSocket Connection Status
 */
export enum WebSocketConnectionStatus {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR',
}
