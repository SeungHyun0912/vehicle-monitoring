/**
 * Path Types - 경로 및 루트 관리
 */

/**
 * Path Type
 */
export enum PathType {
  PLANNED = 'PLANNED', // 계획된 경로
  ACTUAL = 'ACTUAL', // 실제 이동 경로
  DEVIATION = 'DEVIATION', // 경로 이탈
}

/**
 * Waypoint - 경유점
 */
export interface Waypoint {
  id: string;
  x: number;
  y: number;
  z: number;
  timestamp?: Date;
  sequence: number; // 순서
  label?: string;
}

/**
 * Path Segment Status
 */
export enum PathSegmentStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

/**
 * Path Segment - 경로 구간
 */
export interface PathSegment {
  id: string;
  from: Waypoint;
  to: Waypoint;
  distance: number; // meters
  estimatedDuration: number; // seconds
  actualDuration?: number; // seconds
  speed: number; // m/s
  status: PathSegmentStatus;
}

/**
 * Path - 차량 경로
 */
export interface Path {
  id: string;
  vehicleId: string;
  type: PathType;
  waypoints: Waypoint[];
  segments: PathSegment[];
  totalDistance: number; // meters
  estimatedDuration: number; // seconds
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

/**
 * Route - 전체 루트
 */
export interface Route {
  id: string;
  vehicleId: string;
  name: string;
  description?: string;

  // 출발지, 목적지, 경유지
  origin: Waypoint;
  destination: Waypoint;
  waypoints: Waypoint[]; // 경유지들

  // 경로 정보
  path: Path;

  // 진행 상태
  progress: number; // 0-100%
  currentWaypointIndex: number;

  // 통계
  totalDistance: number;
  estimatedArrivalTime?: Date;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Historical Path Point - 과거 이동 경로 포인트
 */
export interface HistoricalPathPoint {
  x: number;
  y: number;
  z: number;
  timestamp: Date;
  speed: number;
  heading: number;
}

/**
 * Historical Path - 과거 이동 경로
 */
export interface HistoricalPath {
  vehicleId: string;
  points: HistoricalPathPoint[];
  startTime: Date;
  endTime: Date;
  totalDistance: number;
  averageSpeed: number;
}

/**
 * Path Statistics
 */
export interface PathStatistics {
  totalDistance: number;
  totalDuration: number;
  averageSpeed: number;
  maxSpeed: number;
  minSpeed: number;
  waypointsVisited: number;
  deviationCount: number;
}

/**
 * Path Filter
 */
export interface PathFilter {
  vehicleId?: string;
  type?: PathType;
  startDate?: Date;
  endDate?: Date;
}
