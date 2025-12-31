import { Link } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';
import { useWebSocket, useAllVehiclesSubscription } from '../hooks/useWebSocket';
import { useVehicleStore } from '../stores/vehicle.store';

function HomePage() {
  const { vehicles, loading, error } = useVehicles();
  const { isConnected } = useWebSocket();
  const { positions, runtimeStates, wsConnectionStatus } = useVehicleStore();

  // Subscribe to all vehicles on mount
  useAllVehiclesSubscription();

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Vehicle Monitoring System</h1>
        <Link
          to="/map"
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
          }}
        >
          🗺️ Map View
        </Link>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <h2>Connection Status</h2>
        <p>
          WebSocket: <strong>{wsConnectionStatus}</strong>
          {isConnected ? ' ✅' : ' ❌'}
        </p>
      </div>

      {loading && <p>Loading vehicles...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}

      <div>
        <h2>Vehicles ({vehicles.length})</h2>
        {vehicles.length === 0 && !loading && (
          <p>No vehicles found. Start the backend simulator to see vehicles.</p>
        )}

        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {vehicles.map((vehicle: any) => {
            const position = positions.get(vehicle.id);
            const state = runtimeStates.get(vehicle.id);

            return (
              <div
                key={vehicle.id}
                style={{
                  border: '1px solid #ccc',
                  padding: '1rem',
                  borderRadius: '4px',
                  backgroundColor: vehicle.isEnabled ? '#f0f8ff' : '#f5f5f5',
                }}
              >
                <h3>{vehicle.name}</h3>
                <p>Type: {vehicle.type}</p>
                <p>Status: {vehicle.status}</p>
                <p>Enabled: {vehicle.isEnabled ? 'Yes' : 'No'}</p>

                {position && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.9em' }}>
                    <strong>Position:</strong>
                    <br />
                    X: {position.x.toFixed(2)}, Y: {position.y.toFixed(2)}, Z: {position.z.toFixed(2)}
                    <br />
                    Heading: {position.heading.toFixed(1)}°
                  </div>
                )}

                {state && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.9em' }}>
                    <strong>State:</strong>
                    <br />
                    Battery: {state.batteryLevel.toFixed(1)}%
                    <br />
                    Speed: {state.currentSpeed.toFixed(2)} m/s
                    <br />
                    Temp: {state.temperature.toFixed(1)}°C
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
        <h3>Instructions</h3>
        <ol>
          <li>Make sure the backend server is running (<code>npm run dev</code>)</li>
          <li>Make sure PostgreSQL and Redis are running</li>
          <li>Run the vehicle simulator (<code>npm run simulator</code>)</li>
          <li>Watch vehicles appear and update in real-time!</li>
        </ol>
      </div>
    </div>
  );
}

export default HomePage;
