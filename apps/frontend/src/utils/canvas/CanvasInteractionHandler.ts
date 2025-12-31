/**
 * Canvas Interaction Handler
 * Handles mouse/touch interactions for canvas (zoom, pan, click)
 */

import { CanvasRenderer } from './CanvasRenderer';

export interface InteractionCallbacks {
  onVehicleClick?: (vehicleId: string) => void;
  onWaypointClick?: (waypointId: string) => void;
  onCanvasClick?: (worldX: number, worldY: number) => void;
}

export class CanvasInteractionHandler {
  private renderer: CanvasRenderer;
  private canvas: HTMLCanvasElement;
  private callbacks: InteractionCallbacks = {};

  // Pan state
  private isPanning = false;
  private lastPanX = 0;
  private lastPanY = 0;

  // Click detection
  private mouseDownPos: { x: number; y: number } | null = null;
  private clickThreshold = 5; // pixels

  constructor(renderer: CanvasRenderer, callbacks?: InteractionCallbacks) {
    this.renderer = renderer;
    this.canvas = renderer.getCanvas();
    if (callbacks) {
      this.callbacks = callbacks;
    }

    this.setupEventListeners();
  }

  /**
   * Setup all event listeners
   */
  private setupEventListeners(): void {
    // Mouse events
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave);
    this.canvas.addEventListener('wheel', this.handleWheel, { passive: false });

    // Touch events
    this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd);

    // Context menu (disable right-click menu)
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  /**
   * Remove all event listeners
   */
  destroy(): void {
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    this.canvas.removeEventListener('mouseleave', this.handleMouseLeave);
    this.canvas.removeEventListener('wheel', this.handleWheel);
    this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    this.canvas.removeEventListener('touchend', this.handleTouchEnd);
  }

  /**
   * Set interaction callbacks
   */
  setCallbacks(callbacks: InteractionCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Mouse down handler
   */
  private handleMouseDown = (e: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.mouseDownPos = { x, y };

    if (e.button === 0) {
      // Left click - start pan or prepare for click
      this.isPanning = true;
      this.lastPanX = x;
      this.lastPanY = y;
      this.canvas.style.cursor = 'grabbing';
    }
  };

  /**
   * Mouse move handler
   */
  private handleMouseMove = (e: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this.isPanning) {
      const dx = x - this.lastPanX;
      const dy = y - this.lastPanY;

      this.renderer.pan(dx, dy);

      this.lastPanX = x;
      this.lastPanY = y;
    }
  };

  /**
   * Mouse up handler
   */
  private handleMouseUp = (e: MouseEvent): void => {
    if (e.button === 0) {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check if it was a click (not a drag)
      if (this.mouseDownPos) {
        const dx = x - this.mouseDownPos.x;
        const dy = y - this.mouseDownPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.clickThreshold) {
          this.handleClick(x, y);
        }
      }

      this.isPanning = false;
      this.mouseDownPos = null;
      this.canvas.style.cursor = 'grab';
    }
  };

  /**
   * Mouse leave handler
   */
  private handleMouseLeave = (): void => {
    this.isPanning = false;
    this.mouseDownPos = null;
    this.canvas.style.cursor = 'default';
  };

  /**
   * Wheel handler (zoom)
   */
  private handleWheel = (e: WheelEvent): void => {
    e.preventDefault();

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const delta = -e.deltaY * 0.001;
    this.renderer.zoom(delta, x, y);
  };

  /**
   * Touch start handler
   */
  private handleTouchStart = (e: TouchEvent): void => {
    e.preventDefault();

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      this.mouseDownPos = { x, y };
      this.isPanning = true;
      this.lastPanX = x;
      this.lastPanY = y;
    }
  };

  /**
   * Touch move handler
   */
  private handleTouchMove = (e: TouchEvent): void => {
    e.preventDefault();

    if (e.touches.length === 1 && this.isPanning) {
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      const dx = x - this.lastPanX;
      const dy = y - this.lastPanY;

      this.renderer.pan(dx, dy);

      this.lastPanX = x;
      this.lastPanY = y;
    } else if (e.touches.length === 2) {
      // Pinch zoom (could be implemented here)
      // For now, just disable panning
      this.isPanning = false;
    }
  };

  /**
   * Touch end handler
   */
  private handleTouchEnd = (e: TouchEvent): void => {
    if (e.touches.length === 0) {
      if (this.mouseDownPos && this.isPanning) {
        const touch = e.changedTouches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        // Check if it was a tap (not a drag)
        const dx = x - this.mouseDownPos.x;
        const dy = y - this.mouseDownPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.clickThreshold) {
          this.handleClick(x, y);
        }
      }

      this.isPanning = false;
      this.mouseDownPos = null;
    }
  };

  /**
   * Handle click/tap
   */
  private handleClick(screenX: number, screenY: number): void {
    const worldPos = this.renderer.screenToWorld(screenX, screenY);

    // Check if clicked on vehicle
    const vehicleLayer = this.renderer.getLayer('vehicles');
    if (vehicleLayer && 'findVehicleAt' in vehicleLayer) {
      const vehicleId = (vehicleLayer as any).findVehicleAt(worldPos.x, worldPos.y);
      if (vehicleId) {
        this.callbacks.onVehicleClick?.(vehicleId);
        return;
      }
    }

    // Check if clicked on waypoint
    const pathLayer = this.renderer.getLayer('paths');
    if (pathLayer && 'findWaypointAt' in pathLayer) {
      const waypoint = (pathLayer as any).findWaypointAt(worldPos.x, worldPos.y);
      if (waypoint) {
        this.callbacks.onWaypointClick?.(waypoint.id);
        return;
      }
    }

    // Canvas click (empty space)
    this.callbacks.onCanvasClick?.(worldPos.x, worldPos.y);
  }
}
