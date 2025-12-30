/**
 * Path Layer - 경로 렌더링
 */

import { RenderLayer, Viewport } from '../CanvasRenderer';
import { Path, PathType, Waypoint, HistoricalPath } from '../../../types/path.types';

export interface PathRenderData {
  path: Path;
  color?: string;
  lineWidth?: number;
}

export class PathLayer implements RenderLayer {
  name = 'paths';
  zIndex = 5;
  visible = true;

  private paths: Map<string, PathRenderData> = new Map();
  private historicalPaths: Map<string, HistoricalPath> = new Map();
  private showWaypoints = true;
  private showHistorical = true;

  /**
   * Add path to render
   */
  addPath(path: Path, color?: string, lineWidth?: number): void {
    this.paths.set(path.id, { path, color, lineWidth });
  }

  /**
   * Remove path
   */
  removePath(pathId: string): void {
    this.paths.delete(pathId);
  }

  /**
   * Add historical path
   */
  addHistoricalPath(vehicleId: string, historicalPath: HistoricalPath): void {
    this.historicalPaths.set(vehicleId, historicalPath);
  }

  /**
   * Clear all paths
   */
  clearPaths(): void {
    this.paths.clear();
  }

  /**
   * Toggle waypoints visibility
   */
  toggleWaypoints(visible?: boolean): void {
    this.showWaypoints = visible !== undefined ? visible : !this.showWaypoints;
  }

  /**
   * Toggle historical paths visibility
   */
  toggleHistorical(visible?: boolean): void {
    this.showHistorical = visible !== undefined ? visible : !this.showHistorical;
  }

  /**
   * Render all paths
   */
  render(ctx: CanvasRenderingContext2D, viewport: Viewport): void {
    // Render historical paths first (bottom layer)
    if (this.showHistorical) {
      for (const historicalPath of this.historicalPaths.values()) {
        this.renderHistoricalPath(ctx, historicalPath, viewport);
      }
    }

    // Render planned/actual paths
    for (const data of this.paths.values()) {
      this.renderPath(ctx, data, viewport);
    }
  }

  /**
   * Render single path
   */
  private renderPath(
    ctx: CanvasRenderingContext2D,
    data: PathRenderData,
    viewport: Viewport
  ): void {
    const { path, color, lineWidth } = data;
    const { waypoints, type } = path;

    if (waypoints.length < 2) return;

    const pathColor = color || this.getPathColor(type);
    const pathLineWidth = lineWidth || (type === PathType.PLANNED ? 2 : 3);

    // Draw path line
    ctx.strokeStyle = pathColor;
    ctx.lineWidth = pathLineWidth;
    ctx.setLineDash(type === PathType.PLANNED ? [5, 5] : []); // Dashed for planned

    ctx.beginPath();
    for (let i = 0; i < waypoints.length; i++) {
      const wp = waypoints[i];
      const screenX = (wp.x - viewport.x) * viewport.scale;
      const screenY = (wp.y - viewport.y) * viewport.scale;

      if (i === 0) {
        ctx.moveTo(screenX, screenY);
      } else {
        ctx.lineTo(screenX, screenY);
      }
    }
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // Draw waypoints
    if (this.showWaypoints) {
      for (let i = 0; i < waypoints.length; i++) {
        const wp = waypoints[i];
        const isFirst = i === 0;
        const isLast = i === waypoints.length - 1;

        this.renderWaypoint(ctx, wp, viewport, isFirst, isLast, pathColor);
      }
    }
  }

  /**
   * Render waypoint marker
   */
  private renderWaypoint(
    ctx: CanvasRenderingContext2D,
    waypoint: Waypoint,
    viewport: Viewport,
    isFirst: boolean,
    isLast: boolean,
    color: string
  ): void {
    const screenX = (waypoint.x - viewport.x) * viewport.scale;
    const screenY = (waypoint.y - viewport.y) * viewport.scale;
    const size = viewport.scale > 0.5 ? 6 : 4;

    // Different shapes for start/end/waypoint
    if (isFirst) {
      // Start: Triangle
      ctx.fillStyle = '#4CAF50';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(screenX, screenY - size);
      ctx.lineTo(screenX + size, screenY + size);
      ctx.lineTo(screenX - size, screenY + size);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (isLast) {
      // End: Square
      ctx.fillStyle = '#F44336';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.fillRect(screenX - size, screenY - size, size * 2, size * 2);
      ctx.strokeRect(screenX - size, screenY - size, size * 2, size * 2);
    } else {
      // Waypoint: Circle
      ctx.fillStyle = color;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Draw label if zoomed in
    if (viewport.scale > 1 && waypoint.label) {
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(waypoint.label, screenX, screenY - size - 3);
    }
  }

  /**
   * Render historical path (breadcrumb trail)
   */
  private renderHistoricalPath(
    ctx: CanvasRenderingContext2D,
    historicalPath: HistoricalPath,
    viewport: Viewport
  ): void {
    const { points } = historicalPath;
    if (points.length < 2) return;

    ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
    ctx.lineWidth = 2;

    ctx.beginPath();
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const screenX = (point.x - viewport.x) * viewport.scale;
      const screenY = (point.y - viewport.y) * viewport.scale;

      if (i === 0) {
        ctx.moveTo(screenX, screenY);
      } else {
        ctx.lineTo(screenX, screenY);
      }
    }
    ctx.stroke();

    // Draw points along historical path
    ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
    const pointInterval = Math.max(1, Math.floor(points.length / 20)); // Show max 20 points
    for (let i = 0; i < points.length; i += pointInterval) {
      const point = points[i];
      const screenX = (point.x - viewport.x) * viewport.scale;
      const screenY = (point.y - viewport.y) * viewport.scale;

      ctx.beginPath();
      ctx.arc(screenX, screenY, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Get default path color based on type
   */
  private getPathColor(type: PathType): string {
    switch (type) {
      case PathType.PLANNED:
        return 'rgba(33, 150, 243, 0.6)'; // Blue
      case PathType.ACTUAL:
        return 'rgba(76, 175, 80, 0.8)'; // Green
      case PathType.DEVIATION:
        return 'rgba(244, 67, 54, 0.8)'; // Red
      default:
        return 'rgba(158, 158, 158, 0.6)'; // Gray
    }
  }

  /**
   * Find waypoint at position (for click handling)
   */
  findWaypointAt(worldX: number, worldY: number, threshold = 10): Waypoint | null {
    for (const data of this.paths.values()) {
      for (const wp of data.path.waypoints) {
        const dx = worldX - wp.x;
        const dy = worldY - wp.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= threshold) {
          return wp;
        }
      }
    }
    return null;
  }
}
