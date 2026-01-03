export class Dimensions {
  constructor(
    public readonly length: number,
    public readonly width: number,
    public readonly height: number,
  ) {}
}

export class VehicleSpecification {
  constructor(
    public readonly maxSpeed: number,
    public readonly maxLoad: number,
    public readonly batteryCapacity: number,
    public readonly dimensions?: Dimensions,
    public readonly weight?: number,
  ) {
    if (maxSpeed <= 0) {
      throw new Error('Max speed must be greater than 0');
    }
    if (maxLoad < 0) {
      throw new Error('Max load must be non-negative');
    }
    if (batteryCapacity <= 0) {
      throw new Error('Battery capacity must be greater than 0');
    }
  }
}
