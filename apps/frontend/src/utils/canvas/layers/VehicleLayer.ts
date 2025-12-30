/**
 * Vehicle Layer - 차량 렌더링
 */

import { RenderLayer, Viewport } from '../CanvasRenderer';
import { AnyVehicle, VehicleType, VehicleStatus, Position } from '../../../types/vehicle.types';

export interface VehicleRenderData {
  vehicle: AnyVehicle;
  position?: Position;
  isSelected?: boolean;
}

export class VehicleLayer implements RenderLayer {
  name = 'vehicles';
  zIndex = 10;
  visible = true;

  private vehicles: Map<string, VehicleRenderData> = new Map();
  private selectedVehicleId: string | null = null;

  /**
   * Set vehicles to render
   */
  setVehicles(vehicles: VehicleRenderData[]): void {
    this.vehicles.clear();
    vehicles.forEach((v) => {
      this.vehicles.set(v.vehicle.id, v);
    });
  }

  /**
   * Update single vehicle
   */
  updateVehicle(vehicleId: string, data: Partial<VehicleRenderData>): void {
    const existing = this.vehicles.get(vehicleId);
    if (existing) {
      this.vehicles.set(vehicleId, { ...existing, ...data });
    }
  }

  /**
   * Set selected vehicle
   */
  setSelectedVehicle(vehicleId: string | null): void {
    this.selectedVehicleId = vehicleId;
  }

  /**
   * Render all vehicles
   */
  render(ctx: CanvasRenderingContext2D, viewport: Viewport): void {
    for (const [id, data] of this.vehicles) {
      const { vehicle, position } = data;

      if (!position) continue;

      // Convert world coordinates to screen coordinates
      const screenX = (position.x - viewport.x) * viewport.scale;
      const screenY = (position.y - viewport.y) * viewport.scale;

      // Viewport culling - only render if in view
      const canvasWidth = ctx.canvas.width / (window.devicePixelRatio || 1);
      const canvasHeight = ctx.canvas.height / (window.devicePixelRatio || 1);
      const vehicleSize = this.getVehicleSize(vehicle.type) * viewport.scale;

      if (
        screenX + vehicleSize < 0 ||
        screenX - vehicleSize > canvasWidth ||
        screenY + vehicleSize < 0 ||
        screenY - vehicleSize > canvasHeight
      ) {
        continue; // Skip rendering if out of view
      }

      const isSelected = id === this.selectedVehicleId;

      this.renderVehicle(ctx, vehicle, position, screenX, screenY, viewport.scale, isSelected);
    }
  }

  /**
   * Render single vehicle
   */
  private renderVehicle(
    ctx: CanvasRenderingContext2D,
    vehicle: AnyVehicle,
    position: Position,
    screenX: number,
    screenY: number,
    scale: number,
    isSelected: boolean
  ): void {
    const size = this.getVehicleSize(vehicle.type) * scale;
    const color = this.getVehicleColor(vehicle);

    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.rotate((position.heading * Math.PI) / 180);

    // Draw selection highlight
    if (isSelected) {
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, size * 1.3, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw vehicle body based on type
    this.drawVehicleShape(ctx, vehicle.type, size, color);

    // Draw direction indicator
    this.drawDirectionIndicator(ctx, size, color);

    ctx.restore();

    // Draw label
    if (scale > 0.5) {
      // Only show labels when zoomed in enough
      this.drawLabel(ctx, vehicle.name, screenX, screenY, size, isSelected);
    }

    // Draw status indicator
    this.drawStatusIndicator(ctx, vehicle.status, screenX, screenY, size);
  }

  /**
   * Draw vehicle shape based on type
   */
  private drawVehicleShape(
    ctx: CanvasRenderingContext2D,
    type: VehicleType,
    size: number,
    color: string
  ): void {
    ctx.fillStyle = color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;

    switch (type) {
      case VehicleType.AMR:
        // Circle for AMR
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;

      case VehicleType.AGV:
        // Rectangle for AGV
        ctx.fillRect(-size, -size * 0.6, size * 2, size * 1.2);
        ctx.strokeRect(-size, -size * 0.6, size * 2, size * 1.2);
        break;

      case VehicleType.OHT:
        // Diamond for OHT
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size, 0);
        ctx.lineTo(0, size);
        ctx.lineTo(-size, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      default:
        // Default circle
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
  }

  /**
   * Draw direction indicator (arrow)
   */
  private drawDirectionIndicator(
    ctx: CanvasRenderingContext2D,
    size: number,
    color: string
  ): void {
    const arrowSize = size * 0.5;
    ctx.fillStyle = '#FFF';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(arrowSize, 0);
    ctx.lineTo(arrowSize * 0.3, -arrowSize * 0.5);
    ctx.lineTo(arrowSize * 0.3, arrowSize * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  /**
   * Draw vehicle label
   */
  private drawLabel(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    size: number,
    isSelected: boolean
  ): void {
    ctx.font = isSelected ? 'bold 14px sans-serif' : '12px sans-serif';
    ctx.fillStyle = isSelected ? '#FFD700' : '#333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // Draw background
    const metrics = ctx.measureText(text);
    const padding = 4;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(
      x - metrics.width / 2 - padding,
      y + size + 5,
      metrics.width + padding * 2,
      16
    );

    // Draw text
    ctx.fillStyle = isSelected ? '#FFD700' : '#333';
    ctx.fillText(text, x, y + size + 7);
  }

  /**
   * Draw status indicator
   */
  private drawStatusIndicator(
    ctx: CanvasRenderingContext2D,
    status: VehicleStatus,
    x: number,
    y: number,
    size: number
  ): void {
    const indicatorSize = 6;
    const color = this.getStatusColor(status);

    ctx.fillStyle = color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.arc(x + size, y - size, indicatorSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  /**
   * Get vehicle size based on type
   */
  private getVehicleSize(type: VehicleType): number {
    switch (type) {
      case VehicleType.AMR:
        return 15;
      case VehicleType.AGV:
        return 18;
      case VehicleType.OHT:
        return 20;
      default:
        return 15;
    }
  }

  /**
   * Get vehicle color based on type and status
   */
  private getVehicleColor(vehicle: AnyVehicle): string {
    if (!vehicle.isEnabled) {
      return '#CCCCCC'; // Gray for disabled
    }

    switch (vehicle.type) {
      case VehicleType.AMR:
        return '#4CAF50'; // Green
      case VehicleType.AGV:
        return '#2196F3'; // Blue
      case VehicleType.OHT:
        return '#FF9800'; // Orange
      default:
        return '#9E9E9E'; // Gray
    }
  }

  /**
   * Get status color
   */
  private getStatusColor(status: VehicleStatus): string {
    switch (status) {
      case VehicleStatus.IDLE:
        return '#FFC107'; // Yellow
      case VehicleStatus.MOVING:
        return '#4CAF50'; // Green
      case VehicleStatus.CHARGING:
        return '#2196F3'; // Blue
      case VehicleStatus.ERROR:
        return '#F44336'; // Red
      case VehicleStatus.STOPPED:
        return '#FF9800'; // Orange
      case VehicleStatus.MAINTENANCE:
        return '#9C27B0'; // Purple
      default:
        return '#9E9E9E'; // Gray
    }
  }

  /**
   * Find vehicle at position (for click handling)
   */
  findVehicleAt(worldX: number, worldY: number): string | null {
    for (const [id, data] of this.vehicles) {
      const { vehicle, position } = data;
      if (!position) continue;

      const size = this.getVehicleSize(vehicle.type);
      const dx = worldX - position.x;
      const dy = worldY - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= size) {
        return id;
      }
    }
    return null;
  }
}
