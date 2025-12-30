import { useEffect, useCallback, useRef } from 'react';
import { useVehicleStore } from '../stores/vehicle.store';
import {
  createWebSocketClient,
  getWebSocketClient,
} from '../services/websocket/websocket.client';
import {
  WebSocketConnectionStatus,
  PositionUpdateMessage,
  StateChangeMessage,
  VehicleErrorMessage,
} from '../types/vehicle.types';

/**
 * Hook for managing WebSocket connection and real-time updates
 */
export function useWebSocket() {
  const {
    updatePosition,
    updateRuntimeState,
    setWsConnectionStatus,
    setError,
  } = useVehicleStore();

  const clientRef = useRef(createWebSocketClient());

  // Handle position updates
  const handlePositionUpdate = useCallback(
    (data: PositionUpdateMessage) => {
      updatePosition(data.vehicleId, {
        ...data.position,
        timestamp: new Date(data.timestamp),
      });
    },
    [updatePosition]
  );

  // Handle state changes
  const handleStateChange = useCallback(
    (data: StateChangeMessage) => {
      updateRuntimeState(data.vehicleId, {
        ...data.state,
        lastUpdateTime: new Date(data.timestamp),
      });
    },
    [updateRuntimeState]
  );

  // Handle errors
  const handleError = useCallback(
    (data: VehicleErrorMessage) => {
      console.error('Vehicle error:', data);
      setError(`Vehicle ${data.vehicleId}: ${data.message}`);
    },
    [setError]
  );

  // Handle connection status changes
  const handleConnect = useCallback(() => {
    console.log('WebSocket connected');
    setWsConnectionStatus(WebSocketConnectionStatus.CONNECTED);
  }, [setWsConnectionStatus]);

  const handleDisconnect = useCallback(() => {
    console.log('WebSocket disconnected');
    setWsConnectionStatus(WebSocketConnectionStatus.DISCONNECTED);
  }, [setWsConnectionStatus]);

  const handleReconnect = useCallback(() => {
    console.log('WebSocket reconnected');
    setWsConnectionStatus(WebSocketConnectionStatus.CONNECTED);
  }, [setWsConnectionStatus]);

  const handleConnectionError = useCallback(
    (error: Error) => {
      console.error('WebSocket connection error:', error);
      setWsConnectionStatus(WebSocketConnectionStatus.ERROR);
      setError(error.message);
    },
    [setWsConnectionStatus, setError]
  );

  // Initialize WebSocket connection
  useEffect(() => {
    const client = clientRef.current;

    // Register event handlers
    client.on({
      onPositionUpdate: handlePositionUpdate,
      onStateChange: handleStateChange,
      onError: handleError,
      onConnect: handleConnect,
      onDisconnect: handleDisconnect,
      onReconnect: handleReconnect,
      onConnectionError: handleConnectionError,
    });

    // Connect
    client.connect();

    // Cleanup on unmount
    return () => {
      client.disconnect();
    };
  }, [
    handlePositionUpdate,
    handleStateChange,
    handleError,
    handleConnect,
    handleDisconnect,
    handleReconnect,
    handleConnectionError,
  ]);

  // Subscribe to vehicle
  const subscribeVehicle = useCallback((vehicleId: string) => {
    const client = getWebSocketClient();
    client?.subscribeVehicle(vehicleId);
  }, []);

  // Unsubscribe from vehicle
  const unsubscribeVehicle = useCallback((vehicleId: string) => {
    const client = getWebSocketClient();
    client?.unsubscribeVehicle(vehicleId);
  }, []);

  // Subscribe to all vehicles
  const subscribeAll = useCallback(() => {
    const client = getWebSocketClient();
    client?.subscribeAll();
  }, []);

  // Unsubscribe from all vehicles
  const unsubscribeAll = useCallback(() => {
    const client = getWebSocketClient();
    client?.unsubscribeAll();
  }, []);

  return {
    subscribeVehicle,
    unsubscribeVehicle,
    subscribeAll,
    unsubscribeAll,
    isConnected: clientRef.current.isConnected(),
    connectionStatus: clientRef.current.getConnectionStatus(),
  };
}

/**
 * Hook to subscribe to specific vehicle updates
 */
export function useVehicleSubscription(vehicleId: string | null) {
  const { subscribeVehicle, unsubscribeVehicle } = useWebSocket();

  useEffect(() => {
    if (vehicleId) {
      subscribeVehicle(vehicleId);
      return () => {
        unsubscribeVehicle(vehicleId);
      };
    }
  }, [vehicleId, subscribeVehicle, unsubscribeVehicle]);
}

/**
 * Hook to subscribe to all vehicles
 */
export function useAllVehiclesSubscription() {
  const { subscribeAll, unsubscribeAll } = useWebSocket();

  useEffect(() => {
    subscribeAll();
    return () => {
      unsubscribeAll();
    };
  }, [subscribeAll, unsubscribeAll]);
}
