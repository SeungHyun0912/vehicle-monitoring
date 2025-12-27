export class VehicleRuntimeState {
  constructor(
    public readonly currentSpeed: number,
    public readonly batteryLevel: number,
    public readonly lastUpdateTime: Date,
    public readonly currentLoad?: number,
    public readonly temperature?: number,
    public readonly errorCodes?: string[],
  ) {
    if (currentSpeed < 0) {
      throw new Error('Current speed cannot be negative');
    }

    if (batteryLevel < 0 || batteryLevel > 100) {
      throw new Error('Battery level must be between 0 and 100');
    }

    if (currentLoad !== undefined && currentLoad < 0) {
      throw new Error('Current load cannot be negative');
    }
  }

  isHealthy(): boolean {
    return (
      this.batteryLevel > 20 &&
      (!this.errorCodes || this.errorCodes.length === 0) &&
      (!this.temperature || this.temperature < 80)
    );
  }

  needsCharging(): boolean {
    return this.batteryLevel < 20;
  }

  hasErrors(): boolean {
    return this.errorCodes !== undefined && this.errorCodes.length > 0;
  }

  isStale(maxAgeMs: number = 5000): boolean {
    const now = new Date();
    return now.getTime() - this.lastUpdateTime.getTime() > maxAgeMs;
  }

  toJSON(): Record<string, any> {
    return {
      currentSpeed: this.currentSpeed,
      batteryLevel: this.batteryLevel,
      lastUpdateTime: this.lastUpdateTime.toISOString(),
      currentLoad: this.currentLoad,
      temperature: this.temperature,
      errorCodes: this.errorCodes,
    };
  }

  static fromJSON(data: any): VehicleRuntimeState {
    return new VehicleRuntimeState(
      data.currentSpeed,
      data.batteryLevel,
      new Date(data.lastUpdateTime),
      data.currentLoad,
      data.temperature,
      data.errorCodes,
    );
  }
}
