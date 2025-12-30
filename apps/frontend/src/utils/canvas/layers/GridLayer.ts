/**
 * Grid Layer - 배경 그리드 렌더링
 */

import { RenderLayer, Viewport } from '../CanvasRenderer';

export interface GridLayerOptions {
  gridSize?: number;
  gridColor?: string;
  majorGridSize?: number;
  majorGridColor?: string;
  showAxes?: boolean;
  axesColor?: string;
}

export class GridLayer implements RenderLayer {
  name = 'grid';
  zIndex = 0;
  visible = true;

  private options: Required<GridLayerOptions>;

  constructor(options: GridLayerOptions = {}) {
    this.options = {
      gridSize: options.gridSize || 1,
      gridColor: options.gridColor || 'rgba(200, 200, 200, 0.3)',
      majorGridSize: options.majorGridSize || 5,
      majorGridColor: options.majorGridColor || 'rgba(150, 150, 150, 0.5)',
      showAxes: options.showAxes !== undefined ? options.showAxes : true,
      axesColor: options.axesColor || 'rgba(100, 100, 100, 0.7)',
    };
  }

  render(ctx: CanvasRenderingContext2D, viewport: Viewport): void {
    const { gridSize, gridColor, majorGridSize, majorGridColor, showAxes, axesColor } = this.options;

    const canvasWidth = ctx.canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = ctx.canvas.height / (window.devicePixelRatio || 1);

    // Calculate visible grid range
    const startX = Math.floor(viewport.x / gridSize) * gridSize;
    const endX = Math.ceil((viewport.x + canvasWidth / viewport.scale) / gridSize) * gridSize;
    const startY = Math.floor(viewport.y / gridSize) * gridSize;
    const endY = Math.ceil((viewport.y + canvasHeight / viewport.scale) / gridSize) * gridSize;

    // Draw minor grid lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let x = startX; x <= endX; x += gridSize) {
      const screenX = (x - viewport.x) * viewport.scale;
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, canvasHeight);
    }

    for (let y = startY; y <= endY; y += gridSize) {
      const screenY = (y - viewport.y) * viewport.scale;
      ctx.moveTo(0, screenY);
      ctx.lineTo(canvasWidth, screenY);
    }

    ctx.stroke();

    // Draw major grid lines
    ctx.strokeStyle = majorGridColor;
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let x = startX; x <= endX; x += gridSize * majorGridSize) {
      const screenX = (x - viewport.x) * viewport.scale;
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, canvasHeight);
    }

    for (let y = startY; y <= endY; y += gridSize * majorGridSize) {
      const screenY = (y - viewport.y) * viewport.scale;
      ctx.moveTo(0, screenY);
      ctx.lineTo(canvasWidth, screenY);
    }

    ctx.stroke();

    // Draw axes
    if (showAxes) {
      ctx.strokeStyle = axesColor;
      ctx.lineWidth = 3;

      // X axis (y = 0)
      const axisY = (0 - viewport.y) * viewport.scale;
      if (axisY >= 0 && axisY <= canvasHeight) {
        ctx.beginPath();
        ctx.moveTo(0, axisY);
        ctx.lineTo(canvasWidth, axisY);
        ctx.stroke();
      }

      // Y axis (x = 0)
      const axisX = (0 - viewport.x) * viewport.scale;
      if (axisX >= 0 && axisX <= canvasWidth) {
        ctx.beginPath();
        ctx.moveTo(axisX, 0);
        ctx.lineTo(axisX, canvasHeight);
        ctx.stroke();
      }
    }
  }

  setOptions(options: Partial<GridLayerOptions>): void {
    this.options = { ...this.options, ...options };
  }
}
