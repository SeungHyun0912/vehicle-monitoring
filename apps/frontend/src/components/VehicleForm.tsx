import React, { useState, useEffect } from 'react';
import { VehicleType, VehicleStatus, AGVGuideType, OHTHoistStatus } from '../types/vehicle.types';

interface VehicleFormProps {
  vehicle?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const VehicleForm: React.FC<VehicleFormProps> = ({
  vehicle,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: VehicleType.AMR,
    status: VehicleStatus.IDLE,
    isEnabled: true,
    // AMR specific
    maxSpeed: 2.0,
    batteryCapacity: 100,
    // AGV specific
    guideType: AGVGuideType.MAGNETIC,
    loadCapacity: 500,
    // OHT specific
    hoistStatus: OHTHoistStatus.UP,
    trackId: '',
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        name: vehicle.name || '',
        type: vehicle.type || VehicleType.AMR,
        status: vehicle.status || VehicleStatus.IDLE,
        isEnabled: vehicle.isEnabled !== undefined ? vehicle.isEnabled : true,
        maxSpeed: vehicle.maxSpeed || 2.0,
        batteryCapacity: vehicle.batteryCapacity || 100,
        guideType: vehicle.guideType || AGVGuideType.MAGNETIC,
        loadCapacity: vehicle.loadCapacity || 500,
        hoistStatus: vehicle.hoistStatus || OHTHoistStatus.UP,
        trackId: vehicle.trackId || '',
      });
    }
  }, [vehicle]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Build input based on vehicle type
    const baseInput: any = {
      name: formData.name,
      type: formData.type,
      status: formData.status,
      isEnabled: formData.isEnabled,
    };

    let input: any = baseInput;

    switch (formData.type) {
      case VehicleType.AMR:
        input = {
          ...baseInput,
          maxSpeed: formData.maxSpeed,
          batteryCapacity: formData.batteryCapacity,
        } as any;
        break;
      case VehicleType.AGV:
        input = {
          ...baseInput,
          guideType: formData.guideType,
          loadCapacity: formData.loadCapacity,
        } as any;
        break;
      case VehicleType.OHT:
        input = {
          ...baseInput,
          hoistStatus: formData.hoistStatus,
          trackId: formData.trackId,
        } as any;
        break;
    }

    onSubmit(input);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Basic Information */}
      <div>
        <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Basic Information</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              disabled={!!vehicle}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            >
              <option value={VehicleType.AMR}>AMR</option>
              <option value={VehicleType.AGV}>AGV</option>
              <option value={VehicleType.OHT}>OHT</option>
              <option value={VehicleType.FORKLIFT}>Forklift</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            >
              <option value={VehicleStatus.IDLE}>Idle</option>
              <option value={VehicleStatus.MOVING}>Moving</option>
              <option value={VehicleStatus.CHARGING}>Charging</option>
              <option value={VehicleStatus.ERROR}>Error</option>
              <option value={VehicleStatus.STOPPED}>Stopped</option>
              <option value={VehicleStatus.MAINTENANCE}>Maintenance</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginTop: '1.8rem' }}>
              <input
                type="checkbox"
                name="isEnabled"
                checked={formData.isEnabled}
                onChange={handleChange}
                style={{ marginRight: '8px' }}
              />
              <span style={{ fontWeight: 'bold' }}>Enabled</span>
            </label>
          </div>
        </div>
      </div>

      {/* Type-specific fields */}
      {formData.type === VehicleType.AMR && (
        <div>
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>AMR Specific</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Max Speed (m/s)
              </label>
              <input
                type="number"
                name="maxSpeed"
                value={formData.maxSpeed}
                onChange={handleChange}
                step="0.1"
                min="0"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Battery Capacity (Ah)
              </label>
              <input
                type="number"
                name="batteryCapacity"
                value={formData.batteryCapacity}
                onChange={handleChange}
                step="1"
                min="0"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {formData.type === VehicleType.AGV && (
        <div>
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>AGV Specific</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Guide Type
              </label>
              <select
                name="guideType"
                value={formData.guideType}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              >
                <option value={AGVGuideType.MAGNETIC}>Magnetic</option>
                <option value={AGVGuideType.LASER}>Laser</option>
                <option value={AGVGuideType.WIRE}>Wire</option>
                <option value={AGVGuideType.VISION}>Vision</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Load Capacity (kg)
              </label>
              <input
                type="number"
                name="loadCapacity"
                value={formData.loadCapacity}
                onChange={handleChange}
                step="10"
                min="0"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {formData.type === VehicleType.OHT && (
        <div>
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>OHT Specific</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Hoist Status
              </label>
              <select
                name="hoistStatus"
                value={formData.hoistStatus}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              >
                <option value={OHTHoistStatus.UP}>Up</option>
                <option value={OHTHoistStatus.DOWN}>Down</option>
                <option value={OHTHoistStatus.MOVING}>Moving</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Track ID
              </label>
              <input
                type="text"
                name="trackId"
                value={formData.trackId}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#999',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
          }}
        >
          {loading ? 'Saving...' : vehicle ? 'Update Vehicle' : 'Create Vehicle'}
        </button>
      </div>
    </form>
  );
};

export default VehicleForm;
