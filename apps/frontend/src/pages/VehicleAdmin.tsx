import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useVehicles, useVehicleMutations } from '../hooks/useVehicles';
import { useVehicleStore } from '../stores/vehicle.store';
import VehicleForm from '../components/VehicleForm';

type ViewMode = 'list' | 'create' | 'edit';

function VehicleAdmin() {
  const { vehicles, loading, error, refetch } = useVehicles();
  const { createVehicle, updateVehicle, deleteVehicle, enableVehicle, disableVehicle, loading: mutationLoading } = useVehicleMutations();
  const { positions, runtimeStates } = useVehicleStore();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleCreate = async (data: any) => {
    try {
      await createVehicle(data);
      await refetch();
      setViewMode('list');
      alert('Vehicle created successfully!');
    } catch (err: any) {
      alert(`Failed to create vehicle: ${err.message}`);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!selectedVehicle) return;

    try {
      await updateVehicle(selectedVehicle.id, data);
      await refetch();
      setViewMode('list');
      setSelectedVehicle(null);
      alert('Vehicle updated successfully!');
    } catch (err: any) {
      alert(`Failed to update vehicle: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }

    try {
      await deleteVehicle(id);
      await refetch();
      setDeleteConfirm(null);
      alert('Vehicle deleted successfully!');
    } catch (err: any) {
      alert(`Failed to delete vehicle: ${err.message}`);
      setDeleteConfirm(null);
    }
  };

  const handleToggleEnabled = async (vehicle: any) => {
    try {
      if (vehicle.isEnabled) {
        await disableVehicle(vehicle.id);
      } else {
        await enableVehicle(vehicle.id);
      }
      await refetch();
    } catch (err: any) {
      alert(`Failed to toggle vehicle: ${err.message}`);
    }
  };

  const handleEdit = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setViewMode('edit');
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedVehicle(null);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Vehicle Administration</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link
            to="/"
            style={{
              padding: '10px 20px',
              backgroundColor: '#666',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
            }}
          >
            Back to Home
          </Link>
          {viewMode === 'list' && (
            <button
              onClick={() => setViewMode('create')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              + Create Vehicle
            </button>
          )}
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && <p>Loading vehicles...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}

      {/* Create/Edit Form */}
      {(viewMode === 'create' || viewMode === 'edit') && (
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2>{viewMode === 'create' ? 'Create New Vehicle' : 'Edit Vehicle'}</h2>
          <VehicleForm
            vehicle={viewMode === 'edit' ? selectedVehicle : undefined}
            onSubmit={viewMode === 'create' ? handleCreate : handleUpdate}
            onCancel={handleCancel}
            loading={mutationLoading}
          />
        </div>
      )}

      {/* Vehicle List */}
      {viewMode === 'list' && (
        <div>
          <h2>Vehicles ({vehicles.length})</h2>

          {vehicles.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
              <p style={{ fontSize: '18px', color: '#666' }}>No vehicles found. Create one to get started!</p>
            </div>
          )}

          {vehicles.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Type</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Enabled</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Position</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Runtime</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle: any) => {
                    const position = positions.get(vehicle.id);
                    const state = runtimeStates.get(vehicle.id);

                    return (
                      <tr key={vehicle.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{vehicle.name}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 8px',
                            backgroundColor: vehicle.type === 'AMR' ? '#4CAF50' : vehicle.type === 'AGV' ? '#2196F3' : '#FF9800',
                            color: 'white',
                            borderRadius: '4px',
                            fontSize: '12px',
                          }}>
                            {vehicle.type}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>{vehicle.status}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleToggleEnabled(vehicle)}
                            style={{
                              padding: '4px 12px',
                              backgroundColor: vehicle.isEnabled ? '#4CAF50' : '#999',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                            }}
                          >
                            {vehicle.isEnabled ? 'ON' : 'OFF'}
                          </button>
                        </td>
                        <td style={{ padding: '12px', fontSize: '12px' }}>
                          {position ? (
                            <div>
                              X: {position.x.toFixed(1)}, Y: {position.y.toFixed(1)}
                            </div>
                          ) : (
                            <span style={{ color: '#999' }}>N/A</span>
                          )}
                        </td>
                        <td style={{ padding: '12px', fontSize: '12px' }}>
                          {state ? (
                            <div>
                              Battery: {state.batteryLevel.toFixed(0)}%
                              <br />
                              Speed: {state.currentSpeed.toFixed(1)} m/s
                            </div>
                          ) : (
                            <span style={{ color: '#999' }}>N/A</span>
                          )}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleEdit(vehicle)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#2196F3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(vehicle.id)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: deleteConfirm === vehicle.id ? '#F44336' : '#FF9800',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                              }}
                            >
                              {deleteConfirm === vehicle.id ? 'Confirm?' : 'Delete'}
                            </button>
                            {deleteConfirm === vehicle.id && (
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: '#999',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                }}
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VehicleAdmin;
