import React, { useMemo } from 'react';
import { useVehicleStore } from '../stores/vehicle.store';
import { VehicleStatus, VehicleType } from '../types/vehicle.types';

export const Dashboard: React.FC = () => {
  const { vehicles, runtimeStates } = useVehicleStore();

  const stats = useMemo(() => {
    const vehicleArray = Array.from(vehicles.values());

    // Basic counts
    const total = vehicleArray.length;
    const active = vehicleArray.filter(v => v.isEnabled).length;
    const inactive = total - active;

    // By type
    const byType = {
      AMR: vehicleArray.filter(v => v.type === VehicleType.AMR).length,
      AGV: vehicleArray.filter(v => v.type === VehicleType.AGV).length,
      OHT: vehicleArray.filter(v => v.type === VehicleType.OHT).length,
      FORKLIFT: vehicleArray.filter(v => v.type === VehicleType.FORKLIFT).length,
    };

    // By status
    const byStatus = {
      IDLE: vehicleArray.filter(v => v.status === VehicleStatus.IDLE).length,
      MOVING: vehicleArray.filter(v => v.status === VehicleStatus.MOVING).length,
      CHARGING: vehicleArray.filter(v => v.status === VehicleStatus.CHARGING).length,
      ERROR: vehicleArray.filter(v => v.status === VehicleStatus.ERROR).length,
      STOPPED: vehicleArray.filter(v => v.status === VehicleStatus.STOPPED).length,
      MAINTENANCE: vehicleArray.filter(v => v.status === VehicleStatus.MAINTENANCE).length,
    };

    // Runtime stats
    const statesArray = Array.from(runtimeStates.values());
    const avgSpeed = statesArray.length > 0
      ? statesArray.reduce((sum, s) => sum + s.currentSpeed, 0) / statesArray.length
      : 0;

    const avgBattery = statesArray.length > 0
      ? statesArray.reduce((sum, s) => sum + s.batteryLevel, 0) / statesArray.length
      : 0;

    const lowBattery = statesArray.filter(s => s.batteryLevel < 20).length;
    const highTemp = statesArray.filter(s => s.temperature > 45).length;
    const withErrors = statesArray.filter(s => s.errorCodes.length > 0).length;

    return {
      total,
      active,
      inactive,
      byType,
      byStatus,
      avgSpeed,
      avgBattery,
      lowBattery,
      highTemp,
      withErrors,
    };
  }, [vehicles, runtimeStates]);

  const StatCard: React.FC<{ title: string; value: string | number; color?: string; subtitle?: string }> = ({
    title,
    value,
    color = '#2196F3',
    subtitle,
  }) => (
    <div
      style={{
        backgroundColor: 'white',
        padding: '1rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        borderLeft: `4px solid ${color}`,
      }}
    >
      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>{title}</div>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{value}</div>
      {subtitle && <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>{subtitle}</div>}
    </div>
  );

  return (
    <div style={{ padding: '1rem' }}>
      <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Dashboard</h2>

      {/* Overview Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard title="Total Vehicles" value={stats.total} color="#2196F3" />
        <StatCard title="Active" value={stats.active} color="#4CAF50" />
        <StatCard title="Inactive" value={stats.inactive} color="#9E9E9E" />
        <StatCard title="Avg Speed" value={`${stats.avgSpeed.toFixed(2)} m/s`} color="#FF9800" />
      </div>

      {/* Type Distribution */}
      <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '16px' }}>By Type</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
          {Object.entries(stats.byType).map(([type, count]) => (
            <div key={type} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <span style={{ fontSize: '14px' }}>{type}</span>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Status Distribution */}
      <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '16px' }}>By Status</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {Object.entries(stats.byStatus).map(([status, count]) => {
            const colors: Record<string, string> = {
              IDLE: '#FFC107',
              MOVING: '#4CAF50',
              CHARGING: '#2196F3',
              ERROR: '#F44336',
              STOPPED: '#FF9800',
              MAINTENANCE: '#9C27B0',
            };
            return (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: colors[status] || '#999' }} />
                <span style={{ fontSize: '14px', flex: 1 }}>{status}</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alerts */}
      {(stats.lowBattery > 0 || stats.highTemp > 0 || stats.withErrors > 0) && (
        <div style={{ backgroundColor: '#FFF3E0', padding: '1rem', borderRadius: '8px', border: '1px solid #FFB74D' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '16px', color: '#F57C00' }}>⚠️ Alerts</h3>
          <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stats.lowBattery > 0 && (
              <div style={{ color: '#F57C00' }}>🔋 {stats.lowBattery} vehicle(s) with low battery (&lt;20%)</div>
            )}
            {stats.highTemp > 0 && (
              <div style={{ color: '#F57C00' }}>🌡️ {stats.highTemp} vehicle(s) with high temperature (&gt;45°C)</div>
            )}
            {stats.withErrors > 0 && (
              <div style={{ color: '#D32F2F' }}>❌ {stats.withErrors} vehicle(s) with errors</div>
            )}
          </div>
        </div>
      )}

      {/* Additional Stats */}
      <div style={{ marginTop: '1rem', backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '16px' }}>Performance</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
          <div style={{ padding: '8px', backgroundColor: '#E3F2FD', borderRadius: '4px' }}>
            <div style={{ fontSize: '12px', color: '#666' }}>Avg Battery</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1976D2' }}>{stats.avgBattery.toFixed(1)}%</div>
          </div>
          <div style={{ padding: '8px', backgroundColor: '#E8F5E9', borderRadius: '4px' }}>
            <div style={{ fontSize: '12px', color: '#666' }}>Moving</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#388E3C' }}>{stats.byStatus.MOVING}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
