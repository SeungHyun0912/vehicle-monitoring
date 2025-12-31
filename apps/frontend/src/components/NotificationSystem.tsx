import React, { useState, useEffect, useCallback } from 'react';
import { useVehicleStore } from '../stores/vehicle.store';

export interface Notification {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  vehicleId?: string;
  autoClose?: boolean;
}

export const NotificationSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { runtimeStates, vehicles } = useVehicleStore();

  // Add notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      autoClose: notification.autoClose !== false,
    };

    setNotifications((prev) => [newNotification, ...prev].slice(0, 10)); // Keep only last 10

    // Auto-close after 5 seconds if enabled
    if (newNotification.autoClose) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, 5000);
    }
  }, []);

  // Remove notification
  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Monitor for alerts
  useEffect(() => {
    const checkAlerts = () => {
      for (const [vehicleId, state] of runtimeStates) {
        const vehicle = vehicles.get(vehicleId);
        if (!vehicle) continue;

        // Low battery alert
        if (state.batteryLevel < 20 && state.batteryLevel > 0) {
          const existingAlert = notifications.find(
            (n) => n.vehicleId === vehicleId && n.title.includes('Low Battery')
          );
          if (!existingAlert) {
            addNotification({
              type: 'warning',
              title: 'Low Battery',
              message: `${vehicle.name} battery is at ${state.batteryLevel.toFixed(1)}%`,
              vehicleId,
              autoClose: false,
            });
          }
        }

        // High temperature alert
        if (state.temperature > 45) {
          const existingAlert = notifications.find(
            (n) => n.vehicleId === vehicleId && n.title.includes('High Temperature')
          );
          if (!existingAlert) {
            addNotification({
              type: 'warning',
              title: 'High Temperature',
              message: `${vehicle.name} temperature is ${state.temperature.toFixed(1)}°C`,
              vehicleId,
              autoClose: false,
            });
          }
        }

        // Error codes
        if (state.errorCodes.length > 0) {
          const existingAlert = notifications.find(
            (n) => n.vehicleId === vehicleId && n.title.includes('Error')
          );
          if (!existingAlert) {
            addNotification({
              type: 'error',
              title: 'Vehicle Error',
              message: `${vehicle.name}: ${state.errorCodes.join(', ')}`,
              vehicleId,
              autoClose: false,
            });
          }
        }
      }
    };

    const interval = setInterval(checkAlerts, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [runtimeStates, vehicles, notifications, addNotification]);

  if (notifications.length === 0) return null;

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'error':
        return { bg: '#FFEBEE', border: '#F44336', text: '#C62828' };
      case 'warning':
        return { bg: '#FFF3E0', border: '#FF9800', text: '#E65100' };
      case 'info':
        return { bg: '#E3F2FD', border: '#2196F3', text: '#1565C0' };
      case 'success':
        return { bg: '#E8F5E9', border: '#4CAF50', text: '#2E7D32' };
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      {notifications.map((notification) => {
        const colors = getNotificationColor(notification.type);
        const icon = getNotificationIcon(notification.type);

        return (
          <div
            key={notification.id}
            style={{
              backgroundColor: colors.bg,
              border: `2px solid ${colors.border}`,
              borderRadius: '8px',
              padding: '12px 16px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              animation: 'slideIn 0.3s ease-out',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <div style={{ fontSize: '20px' }}>{icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', color: colors.text, marginBottom: '4px' }}>
                {notification.title}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>{notification.message}</div>
              <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                {notification.timestamp.toLocaleTimeString()}
              </div>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: '#999',
                padding: '0 4px',
              }}
            >
              ×
            </button>
          </div>
        );
      })}

      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default NotificationSystem;
