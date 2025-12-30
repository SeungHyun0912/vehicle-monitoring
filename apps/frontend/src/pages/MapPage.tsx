import { useState } from 'react';
import { useVehicles } from '../hooks/useVehicles';
import { useAllVehiclesSubscription } from '../hooks/useWebSocket';
import { useVehicleStore } from '../stores/vehicle.store';
import MapCanvas from '../components/MapCanvas';

function MapPage() {
  const { vehicles, loading } = useVehicles();
  const { positions, runtimeStates, selectedVehicleId, wsConnectionStatus } = useVehicleStore();
  useAllVehiclesSubscription();

  const [showGrid, setShowGrid] = useState(true);
  const selectedVehicle = selectedVehicleId ? Array.from(vehicles.values()).find(v => v.id === selectedVehicleId) : null;
  const selectedPosition = selectedVehicleId ? positions.get(selectedVehicleId) : null;
  const selectedState = selectedVehicleId ? runtimeStates.get(selectedVehicleId) : null;

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '1rem', backgroundColor: '#2196F3', color: 'white' }}>
        <h1 style={{ margin: 0 }}>Vehicle Monitoring - Map View</h1>
        <div style={{ fontSize: '14px', marginTop: '5px' }}>
          WebSocket: {wsConnectionStatus} | Vehicles: {vehicles.size} |
          Active: {Array.from(vehicles.values()).filter(v => v.isEnabled).length}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: '300px', backgroundColor: '#F5F5F5', padding: '1rem', overflowY: 'auto' }}>
          <h3>Controls</h3>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              Show Grid
            </label>
          </div>

          <h3>Vehicle List</h3>
          {loading && <p>Loading...</p>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Array.from(vehicles.values()).map((vehicle) => {
              const position = positions.get(vehicle.id);
              const isSelected = vehicle.id === selectedVehicleId;

              return (
                <div
                  key={vehicle.id}
                  style={{
                    padding: '10px',
                    backgroundColor: isSelected ? '#E3F2FD' : 'white',
                    border: isSelected ? '2px solid #2196F3' : '1px solid #DDD',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                  onClick={() => {
                    useVehicleStore.getState().setSelectedVehicleId(vehicle.id);
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>{vehicle.name}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Type: {vehicle.type} | Status: {vehicle.status}
                  </div>
                  {position && (
                    <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                      Pos: ({position.x.toFixed(1)}, {position.y.toFixed(1)})
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected Vehicle Details */}
          {selectedVehicle && (
            <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'white', borderRadius: '4px' }}>
              <h3 style={{ marginTop: 0 }}>Selected Vehicle</h3>
              <div style={{ fontSize: '14px' }}>
                <strong>{selectedVehicle.name}</strong>
                <div>Type: {selectedVehicle.type}</div>
                <div>Status: {selectedVehicle.status}</div>
                <div>Enabled: {selectedVehicle.isEnabled ? 'Yes' : 'No'}</div>

                {selectedPosition && (
                  <div style={{ marginTop: '10px' }}>
                    <strong>Position:</strong>
                    <div>X: {selectedPosition.x.toFixed(2)}</div>
                    <div>Y: {selectedPosition.y.toFixed(2)}</div>
                    <div>Z: {selectedPosition.z.toFixed(2)}</div>
                    <div>Heading: {selectedPosition.heading.toFixed(1)}°</div>
                  </div>
                )}

                {selectedState && (
                  <div style={{ marginTop: '10px' }}>
                    <strong>State:</strong>
                    <div>Battery: {selectedState.batteryLevel.toFixed(1)}%</div>
                    <div>Speed: {selectedState.currentSpeed.toFixed(2)} m/s</div>
                    <div>Temp: {selectedState.temperature.toFixed(1)}°C</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Map Canvas */}
        <div style={{ flex: 1 }}>
          <MapCanvas
            width="100%"
            height="100%"
            showGrid={showGrid}
            showPaths={true}
          />
        </div>
      </div>
    </div>
  );
}

export default MapPage;
