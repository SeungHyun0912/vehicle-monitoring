export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface EulerAngles {
  roll: number;
  pitch: number;
  yaw: number;
}

export class VehiclePosition {
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly z: number,
    public readonly heading: number,
    public readonly timestamp: Date,
    public readonly mapId?: string,
    public readonly rotation?: Quaternion,
    public readonly euler?: EulerAngles,
  ) {
    if (heading < 0 || heading >= 360) {
      throw new Error('Heading must be between 0 and 360 degrees');
    }

    if (rotation && !this.isValidQuaternion(rotation)) {
      throw new Error('Invalid quaternion: must be normalized');
    }
  }

  private isValidQuaternion(q: Quaternion): boolean {
    const magnitude = Math.sqrt(q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w);
    return Math.abs(magnitude - 1.0) < 0.01;
  }

  distanceTo(other: VehiclePosition): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const dz = this.z - other.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  isStale(maxAgeMs: number = 5000): boolean {
    const now = new Date();
    return now.getTime() - this.timestamp.getTime() > maxAgeMs;
  }

  toJSON(): Record<string, any> {
    return {
      x: this.x,
      y: this.y,
      z: this.z,
      heading: this.heading,
      timestamp: this.timestamp.toISOString(),
      mapId: this.mapId,
      rotation: this.rotation,
      euler: this.euler,
    };
  }

  static fromJSON(data: any): VehiclePosition {
    return new VehiclePosition(
      data.x,
      data.y,
      data.z,
      data.heading,
      new Date(data.timestamp),
      data.mapId,
      data.rotation,
      data.euler,
    );
  }
}
