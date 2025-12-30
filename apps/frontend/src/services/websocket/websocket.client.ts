import { io, Socket } from 'socket.io-client';
import {
  PositionUpdateMessage,
  StateChangeMessage,
  VehicleErrorMessage,
  WebSocketConnectionStatus,
  WebSocketMessageType,
} from '../../types/vehicle.types';

/**
 * WebSocket Client Configuration
 */
interface WebSocketConfig {
  url: string;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
}

/**
 * Event Handlers
 */
interface WebSocketEventHandlers {
  onPositionUpdate?: (data: PositionUpdateMessage) => void;
  onStateChange?: (data: StateChangeMessage) => void;
  onError?: (data: VehicleErrorMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onReconnect?: () => void;
  onConnectionError?: (error: Error) => void;
}

/**
 * WebSocket Client for Vehicle Monitoring
 * Handles real-time updates from backend via Socket.IO
 */
export class VehicleWebSocketClient {
  private socket: Socket | null = null;
  private config: WebSocketConfig;
  private handlers: WebSocketEventHandlers = {};
  private connectionStatus: WebSocketConnectionStatus =
    WebSocketConnectionStatus.DISCONNECTED;
  private reconnectAttempts = 0;

  constructor(config: WebSocketConfig) {
    this.config = {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      ...config,
    };
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.socket?.connected) {
      console.warn('WebSocket is already connected');
      return;
    }

    this.connectionStatus = WebSocketConnectionStatus.CONNECTING;

    this.socket = io(this.config.url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.config.reconnectionAttempts,
      reconnectionDelay: this.config.reconnectionDelay,
      reconnectionDelayMax: this.config.reconnectionDelayMax,
    });

    this.setupEventListeners();
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionStatus = WebSocketConnectionStatus.DISCONNECTED;
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.connectionStatus = WebSocketConnectionStatus.CONNECTED;
      this.reconnectAttempts = 0;
      this.handlers.onConnect?.();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.connectionStatus = WebSocketConnectionStatus.DISCONNECTED;
      this.handlers.onDisconnect?.();
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.connectionStatus = WebSocketConnectionStatus.ERROR;
      this.reconnectAttempts++;
      this.handlers.onConnectionError?.(error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('WebSocket reconnected after', attemptNumber, 'attempts');
      this.connectionStatus = WebSocketConnectionStatus.CONNECTED;
      this.handlers.onReconnect?.();
    });

    // Data events
    this.socket.on(
      WebSocketMessageType.POSITION_UPDATE,
      (data: PositionUpdateMessage) => {
        this.handlers.onPositionUpdate?.(data);
      }
    );

    this.socket.on(
      WebSocketMessageType.STATE_CHANGE,
      (data: StateChangeMessage) => {
        this.handlers.onStateChange?.(data);
      }
    );

    this.socket.on(
      WebSocketMessageType.ERROR,
      (data: VehicleErrorMessage) => {
        this.handlers.onError?.(data);
      }
    );
  }

  /**
   * Subscribe to specific vehicle updates
   */
  subscribeVehicle(vehicleId: string): void {
    if (!this.socket?.connected) {
      console.warn('WebSocket not connected');
      return;
    }

    this.socket.emit(WebSocketMessageType.SUBSCRIBE_VEHICLE, { vehicleId });
  }

  /**
   * Unsubscribe from specific vehicle updates
   */
  unsubscribeVehicle(vehicleId: string): void {
    if (!this.socket?.connected) {
      console.warn('WebSocket not connected');
      return;
    }

    this.socket.emit(WebSocketMessageType.UNSUBSCRIBE_VEHICLE, { vehicleId });
  }

  /**
   * Subscribe to all vehicles
   */
  subscribeAll(): void {
    if (!this.socket?.connected) {
      console.warn('WebSocket not connected');
      return;
    }

    this.socket.emit(WebSocketMessageType.SUBSCRIBE_ALL);
  }

  /**
   * Unsubscribe from all vehicles
   */
  unsubscribeAll(): void {
    if (!this.socket?.connected) {
      console.warn('WebSocket not connected');
      return;
    }

    this.socket.emit(WebSocketMessageType.UNSUBSCRIBE_ALL);
  }

  /**
   * Register event handlers
   */
  on(handlers: WebSocketEventHandlers): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): WebSocketConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Get number of reconnect attempts
   */
  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }
}

/**
 * Create singleton instance
 */
let instance: VehicleWebSocketClient | null = null;

export function createWebSocketClient(
  config?: Partial<WebSocketConfig>
): VehicleWebSocketClient {
  if (!instance) {
    const defaultConfig = {
      url:
        import.meta.env.VITE_WEBSOCKET_URL ||
        'http://localhost:4000/vehicles',
    };
    instance = new VehicleWebSocketClient({ ...defaultConfig, ...config });
  }
  return instance;
}

export function getWebSocketClient(): VehicleWebSocketClient | null {
  return instance;
}
