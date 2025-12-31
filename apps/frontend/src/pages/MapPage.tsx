import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';
import { useAllVehiclesSubscription } from '../hooks/useWebSocket';
import { useVehicleStore } from '../stores/vehicle.store';
import MapCanvas from '../components/MapCanvas';
import VehicleFilter from '../components/VehicleFilter';
import Dashboard from '../components/Dashboard';
import NotificationSystem from '../components/NotificationSystem';

type ViewMode = 'list' | 'dashboard';

function MapPage() {
  const { vehicles, loading } = useVehicles();
  const { positions, runtimeStates, selectedVehicleId, getFilteredVehicles, wsConnectionStatus } = useVehicleStore();
  useAllVehiclesSubscription();

  const [showGrid, setShowGrid] = useState(true);
  const [sidebarView, setSidebarView] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'battery' | 'status'>('name');

  const filteredVehicles = getFilteredVehicles()
    .filter(vehicle =>
      searchQuery === '' || vehicle.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'battery': {
          const batteryA = runtimeStates.get(a.id)?.batteryLevel || 0;
          const batteryB = runtimeStates.get(b.id)?.batteryLevel || 0;
          return batteryB - batteryA;
        }
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const selectedVehicle = selectedVehicleId ? Array.from(vehicles.values()).find((v: any) => v.id === selectedVehicleId) : null;
  const selectedPosition = selectedVehicleId ? positions.get(selectedVehicleId) : null;
  const selectedState = selectedVehicleId ? runtimeStates.get(selectedVehicleId) : null;

  return (
    <>
      <NotificationSystem />

      <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '1rem 1.5rem', backgroundColor: '#2196F3', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px' }}>🗺️ Vehicle Monitoring - Map View</h1>
            <div style={{ fontSize: '13px', marginTop: '5px', opacity: 0.9 }}>
              WebSocket: {wsConnectionStatus} |
              Vehicles: {vehicles.size} |
              Active: {Array.from(vehicles.values()).filter((v: any) => v.isEnabled).length} |
              Filtered: {filteredVehicles.length}
            </div>
          </div>
          <Link
            to="/"
            style={{
              padding: '8px 16px',
              backgroundColor: 'white',
              color: '#2196F3',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              fontSize: '14px',
            }}
          >
            📋 List View
          </Link>
        </div>

        {/* Main Content */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar */}
          <div style={{ width: '350px', backgroundColor: '#F5F5F5', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            {/* View Toggle */}
            <div style={{ padding: '1rem', backgroundColor: 'white', borderBottom: '1px solid #E0E0E0' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setSidebarView('list')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: sidebarView === 'list' ? '#2196F3' : 'white',
                    color: sidebarView === 'list' ? 'white' : '#666',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: sidebarView === 'list' ? 'bold' : 'normal',
                  }}
                >
                  📋 List
                </button>
                <button
                  onClick={() => setSidebarView('dashboard')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: sidebarView === 'dashboard' ? '#2196F3' : 'white',
                    color: sidebarView === 'dashboard' ? 'white' : '#666',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: sidebarView === 'dashboard' ? 'bold' : 'normal',
                  }}
                >
                  📊 Dashboard
                </button>
              </div>
            </div>

            {/* Content based on view */}
            {sidebarView === 'dashboard' ? (
              <Dashboard />
            ) : (
              <div style={{ padding: '1rem' }}>
                {/* Filter */}
                <VehicleFilter />

                {/* Search */}
                <div style={{ marginBottom: '1rem' }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search vehicles..."
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                    }}
                  />
                </div>

                {/* Sort */}
                <div style={{ marginBottom: '1rem' }}>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                    }}
                  >
                    <option value="name">Sort by Name</option>
                    <option value="battery">Sort by Battery</option>
                    <option value="status">Sort by Status</option>
                  </select>
                </div>

                {/* Controls */}
                {/* @ts-ignore TypeScript false positive */}
                <div style={{ marginBottom: '1rem', padding: '10px', backgroundColor: 'white', borderRadius: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={showGrid}
                      onChange={(e) => setShowGrid(e.target.checked)}
                      style={{ marginRight: '8px' }}
                    />
                    <span style={{ fontSize: '14px' }}>Show Grid</span>
                  </label>
                </div>

                {/* Vehicle List */}
                <h3 style={{ marginBottom: '1rem' }}>Vehicles ({filteredVehicles.length})</h3>
                {loading && <p style={{ textAlign: 'center', color: '#666' }}>Loading...</p>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {filteredVehicles.map((vehicle) => {
                    const position = positions.get(vehicle.id);
                    const state = runtimeStates.get(vehicle.id);
                    const isSelected = vehicle.id === selectedVehicleId;

                    return (
                      <div
                        key={vehicle.id}
                        style={{
                          padding: '12px',
                          backgroundColor: isSelected ? '#E3F2FD' : 'white',
                          border: isSelected ? '2px solid #2196F3' : '1px solid #DDD',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          transition: 'all 0.2s',
                        }}
                        onClick={() => {
                          useVehicleStore.getState().setSelectedVehicleId(vehicle.id);
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = '#F5F5F5';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = 'white';
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{vehicle.name}</div>
                          <div
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: vehicle.isEnabled ? '#4CAF50' : '#999',
                            }}
                          />
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                          {vehicle.type} • {vehicle.status}
                        </div>
                        {position && (
                          <div style={{ fontSize: '11px', color: '#999' }}>
                            📍 ({position.x.toFixed(1)}, {position.y.toFixed(1)})
                          </div>
                        )}
                        {state && (
                          <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                            🔋 {state.batteryLevel.toFixed(0)}% •
                            🌡️ {state.temperature.toFixed(1)}°C
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Selected Vehicle Details */}
                {selectedVehicle && (
                  <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'white', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#2196F3' }}>Selected Vehicle</h3>
                    <div style={{ fontSize: '14px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '8px' }}>{(selectedVehicle as any).name}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#666' }}>Type</div>
                          <div style={{ fontWeight: 'bold' }}>{(selectedVehicle as any).type}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#666' }}>Status</div>
                          <div style={{ fontWeight: 'bold' }}>{(selectedVehicle as any).status}</div>
                        </div>
                      </div>

                      {selectedPosition && (
                        <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#F5F5F5', borderRadius: '4px' }}>
                          <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Position</div>
                          <div style={{ fontSize: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                            <div>X: {selectedPosition.x.toFixed(2)}</div>
                            <div>Y: {selectedPosition.y.toFixed(2)}</div>
                            <div>Z: {selectedPosition.z.toFixed(2)}</div>
                            <div>H: {selectedPosition.heading.toFixed(1)}°</div>
                          </div>
                        </div>
                      )}

                      {selectedState && (
                        <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#F5F5F5', borderRadius: '4px' }}>
                          <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Runtime State</div>
                          <div style={{ fontSize: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                            <div>Battery: {selectedState.batteryLevel.toFixed(1)}%</div>
                            <div>Speed: {selectedState.currentSpeed.toFixed(2)} m/s</div>
                            <div>Load: {selectedState.currentLoad}</div>
                            <div>Temp: {selectedState.temperature.toFixed(1)}°C</div>
                          </div>
                          {selectedState.errorCodes.length > 0 && (
                            <div style={{ marginTop: '8px', color: '#F44336', fontSize: '12px' }}>
                              ⚠️ Errors: {selectedState.errorCodes.join(', ')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Map Canvas */}
          <div style={{ flex: 1, position: 'relative' }}>
            <MapCanvas
              width="100%"
              height="100%"
              showGrid={showGrid}
              showPaths={true}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default MapPage;
