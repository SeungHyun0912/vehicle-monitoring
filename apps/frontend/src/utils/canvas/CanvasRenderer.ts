/**
 * Canvas Rendering Engine
 * Handles all canvas rendering with layers and performance optimization
 */

export interface Point {
  x: number;
  y: number;
}

export interface Viewport {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
}

export interface RenderLayer {
  name: string;
  zIndex: number;
  visible: boolean;
  render: (ctx: CanvasRenderingContext2D, viewport: Viewport) => void;
}

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private layers: Map<string, RenderLayer> = new Map();
  private viewport: Viewport;
  private animationFrameId: number | null = null;
  private isRendering = false;

  // Performance optimization
  private lastFrameTime = 0;
  private targetFPS = 60;
  private frameInterval: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = ctx;

    this.frameInterval = 1000 / this.targetFPS;

    // Initialize viewport
    this.viewport = {
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height,
      scale: 1,
    };

    this.setupCanvas();
  }

  /**
   * Setup canvas with device pixel ratio for crisp rendering
   */
  private setupCanvas(): void {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);

    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
  }

  /**
   * Add a render layer
   */
  addLayer(layer: RenderLayer): void {
    this.layers.set(layer.name, layer);
  }

  /**
   * Remove a render layer
   */
  removeLayer(name: string): void {
    this.layers.delete(name);
  }

  /**
   * Get a render layer
   */
  getLayer(name: string): RenderLayer | undefined {
    return this.layers.get(name);
  }

  /**
   * Toggle layer visibility
   */
  toggleLayer(name: string, visible?: boolean): void {
    const layer = this.layers.get(name);
    if (layer) {
      layer.visible = visible !== undefined ? visible : !layer.visible;
    }
  }

  /**
   * Set viewport
   */
  setViewport(viewport: Partial<Viewport>): void {
    this.viewport = { ...this.viewport, ...viewport };
  }

  /**
   * Get viewport
   */
  getViewport(): Viewport {
    return { ...this.viewport };
  }

  /**
   * World to screen coordinates
   */
  worldToScreen(worldX: number, worldY: number): Point {
    return {
      x: (worldX - this.viewport.x) * this.viewport.scale,
      y: (worldY - this.viewport.y) * this.viewport.scale,
    };
  }

  /**
   * Screen to world coordinates
   */
  screenToWorld(screenX: number, screenY: number): Point {
    return {
      x: screenX / this.viewport.scale + this.viewport.x,
      y: screenY / this.viewport.scale + this.viewport.y,
    };
  }

  /**
   * Zoom in/out
   */
  zoom(delta: number, centerX?: number, centerY?: number): void {
    const minScale = 0.1;
    const maxScale = 10;

    const oldScale = this.viewport.scale;
    const newScale = Math.max(
      minScale,
      Math.min(maxScale, oldScale * (1 + delta))
    );

    if (centerX !== undefined && centerY !== undefined) {
      // Zoom towards a specific point
      const worldPoint = this.screenToWorld(centerX, centerY);
      this.viewport.scale = newScale;
      const newScreenPoint = this.worldToScreen(worldPoint.x, worldPoint.y);

      this.viewport.x += (centerX - newScreenPoint.x) / newScale;
      this.viewport.y += (centerY - newScreenPoint.y) / newScale;
    } else {
      // Zoom towards center
      this.viewport.scale = newScale;
    }
  }

  /**
   * Pan the viewport
   */
  pan(dx: number, dy: number): void {
    this.viewport.x -= dx / this.viewport.scale;
    this.viewport.y -= dy / this.viewport.scale;
  }

  /**
   * Reset viewport to default
   */
  resetViewport(): void {
    this.viewport = {
      x: 0,
      y: 0,
      width: this.canvas.width,
      height: this.canvas.height,
      scale: 1,
    };
  }

  /**
   * Check if a point is in viewport
   */
  isInViewport(worldX: number, worldY: number): boolean {
    const screen = this.worldToScreen(worldX, worldY);
    return (
      screen.x >= 0 &&
      screen.x <= this.canvas.width &&
      screen.y >= 0 &&
      screen.y <= this.canvas.height
    );
  }

  /**
   * Main render loop
   */
  private render = (timestamp: number): void => {
    if (!this.isRendering) return;

    // FPS limiting
    const elapsed = timestamp - this.lastFrameTime;
    if (elapsed < this.frameInterval) {
      this.animationFrameId = requestAnimationFrame(this.render);
      return;
    }

    this.lastFrameTime = timestamp - (elapsed % this.frameInterval);

    // Clear canvas
    this.clear();

    // Get sorted layers by zIndex
    const sortedLayers = Array.from(this.layers.values()).sort(
      (a, b) => a.zIndex - b.zIndex
    );

    // Render each visible layer
    this.ctx.save();
    for (const layer of sortedLayers) {
      if (layer.visible) {
        this.ctx.save();
        layer.render(this.ctx, this.viewport);
        this.ctx.restore();
      }
    }
    this.ctx.restore();

    this.animationFrameId = requestAnimationFrame(this.render);
  };

  /**
   * Clear canvas
   */
  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Start rendering
   */
  start(): void {
    if (this.isRendering) return;
    this.isRendering = true;
    this.lastFrameTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.render);
  }

  /**
   * Stop rendering
   */
  stop(): void {
    this.isRendering = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Resize canvas
   */
  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this.viewport.width = width;
    this.viewport.height = height;
    this.setupCanvas();
  }

  /**
   * Get canvas element
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Get context
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stop();
    this.layers.clear();
  }
}
