import React, { useState } from 'react';
import { VehicleType, VehicleStatus } from '../types/vehicle.types';
import { useVehicleStore } from '../stores/vehicle.store';

interface VehicleFilterProps {
  onFilterChange?: () => void;
}

export const VehicleFilter: React.FC<VehicleFilterProps> = ({ onFilterChange }) => {
  const { filter, setFilter } = useVehicleStore();
  const [searchQuery, setSearchQuery] = useState('');

  const handleTypeChange = (type: VehicleType | 'ALL') => {
    setFilter({
      ...filter,
      type: type === 'ALL' ? undefined : type,
    });
    onFilterChange?.();
  };

  const handleStatusChange = (status: VehicleStatus | 'ALL') => {
    setFilter({
      ...filter,
      status: status === 'ALL' ? undefined : status,
    });
    onFilterChange?.();
  };

  const handleEnabledChange = (enabled: boolean | null) => {
    setFilter({
      ...filter,
      isEnabled: enabled === null ? undefined : enabled,
    });
    onFilterChange?.();
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    // Search is handled in the component that uses this filter
  };

  const clearFilters = () => {
    setFilter({});
    setSearchQuery('');
    onFilterChange?.();
  };

  return (
    <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '4px', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Filters</h3>
        <button
          onClick={clearFilters}
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            backgroundColor: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Clear All
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
          Search
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search by name..."
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        />
      </div>

      {/* Vehicle Type */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
          Type
        </label>
        <select
          value={filter.type || 'ALL'}
          onChange={(e) => handleTypeChange(e.target.value as VehicleType | 'ALL')}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          <option value="ALL">All Types</option>
          <option value={VehicleType.AMR}>AMR</option>
          <option value={VehicleType.AGV}>AGV</option>
          <option value={VehicleType.OHT}>OHT</option>
          <option value={VehicleType.FORKLIFT}>FORKLIFT</option>
        </select>
      </div>

      {/* Status */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
          Status
        </label>
        <select
          value={filter.status || 'ALL'}
          onChange={(e) => handleStatusChange(e.target.value as VehicleStatus | 'ALL')}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          <option value="ALL">All Status</option>
          <option value={VehicleStatus.IDLE}>Idle</option>
          <option value={VehicleStatus.MOVING}>Moving</option>
          <option value={VehicleStatus.CHARGING}>Charging</option>
          <option value={VehicleStatus.ERROR}>Error</option>
          <option value={VehicleStatus.STOPPED}>Stopped</option>
          <option value={VehicleStatus.MAINTENANCE}>Maintenance</option>
        </select>
      </div>

      {/* Enabled Status */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
          Enabled
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flex: 1 }}>
            <input
              type="radio"
              name="enabled"
              checked={filter.isEnabled === undefined}
              onChange={() => handleEnabledChange(null)}
              style={{ marginRight: '4px' }}
            />
            <span style={{ fontSize: '14px' }}>All</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flex: 1 }}>
            <input
              type="radio"
              name="enabled"
              checked={filter.isEnabled === true}
              onChange={() => handleEnabledChange(true)}
              style={{ marginRight: '4px' }}
            />
            <span style={{ fontSize: '14px' }}>Yes</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flex: 1 }}>
            <input
              type="radio"
              name="enabled"
              checked={filter.isEnabled === false}
              onChange={() => handleEnabledChange(false)}
              style={{ marginRight: '4px' }}
            />
            <span style={{ fontSize: '14px' }}>No</span>
          </label>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(filter.type || filter.status || filter.isEnabled !== undefined) && (
        <div style={{ fontSize: '12px', color: '#666', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
          <strong>Active Filters:</strong>
          <div>
            {filter.type && <span style={{ marginRight: '8px' }}>Type: {filter.type}</span>}
            {filter.status && <span style={{ marginRight: '8px' }}>Status: {filter.status}</span>}
            {filter.isEnabled !== undefined && <span>Enabled: {filter.isEnabled ? 'Yes' : 'No'}</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleFilter;
