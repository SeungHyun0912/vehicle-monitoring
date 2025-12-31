import { useQuery, useMutation } from '@apollo/client/react';
import { useCallback, useEffect } from 'react';
import {
  GET_VEHICLES,
  GET_VEHICLE,
  GET_VEHICLE_POSITION,
  GET_VEHICLE_RUNTIME_STATE,
  GET_VEHICLES_BY_TYPE,
  GET_ENABLED_VEHICLES,
} from '../services/graphql/queries';
import {
  CREATE_VEHICLE,
  UPDATE_VEHICLE,
  DELETE_VEHICLE,
  ENABLE_VEHICLE,
  DISABLE_VEHICLE,
  UPDATE_VEHICLE_STATUS,
} from '../services/graphql/mutations';
import { useVehicleStore } from '../stores/vehicle.store';
import {
  VehicleFilter,
  VehicleType,
  VehicleStatus,
} from '../types/vehicle.types';

/**
 * Hook for managing vehicles list
 */
export function useVehicles(filter?: VehicleFilter) {
  const { setVehicles, setLoading, setError } = useVehicleStore();

  const { data, loading, error, refetch } = useQuery(GET_VEHICLES, {
    variables: { filter },
  });

  useEffect(() => {
    setLoading(loading);
  }, [loading, setLoading]);

  useEffect(() => {
    if ((data as any)?.vehicles) {
      setVehicles((data as any).vehicles);
    }
  }, [data, setVehicles]);

  useEffect(() => {
    if (error) {
      setError(error.message);
    }
  }, [error, setError]);

  return {
    vehicles: (data as any)?.vehicles || [],
    loading,
    error,
    refetch,
  };
}

/**
 * Hook for managing single vehicle
 */
export function useVehicle(id: string) {
  const { updateVehicle, setError } = useVehicleStore();

  const { data, loading, error, refetch } = useQuery(GET_VEHICLE, {
    variables: { id },
    skip: !id,
  });

  useEffect(() => {
    if ((data as any)?.vehicle) {
      updateVehicle(id, (data as any).vehicle);
    }
  }, [data, id, updateVehicle]);

  useEffect(() => {
    if (error) {
      setError(error.message);
    }
  }, [error, setError]);

  return {
    vehicle: (data as any)?.vehicle,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook for vehicle mutations
 */
export function useVehicleMutations() {
  // Mutations don't need store integration - they return results directly

  const [createVehicleMutation, { loading: creating }] = useMutation(CREATE_VEHICLE);
  const [updateVehicleMutation, { loading: updating }] = useMutation(UPDATE_VEHICLE);
  const [deleteVehicleMutation, { loading: deleting }] = useMutation(DELETE_VEHICLE);
  const [enableVehicleMutation] = useMutation(ENABLE_VEHICLE);
  const [disableVehicleMutation] = useMutation(DISABLE_VEHICLE);
  const [updateStatusMutation] = useMutation(UPDATE_VEHICLE_STATUS);

  return {
    createVehicle: useCallback(
      (input: any) => createVehicleMutation({ variables: { input } }),
      [createVehicleMutation]
    ),
    updateVehicle: useCallback(
      (id: string, input: any) =>
        updateVehicleMutation({ variables: { id, input } }),
      [updateVehicleMutation]
    ),
    deleteVehicle: useCallback(
      (id: string) => deleteVehicleMutation({ variables: { id } }),
      [deleteVehicleMutation]
    ),
    enableVehicle: useCallback(
      (id: string) => enableVehicleMutation({ variables: { id } }),
      [enableVehicleMutation]
    ),
    disableVehicle: useCallback(
      (id: string) => disableVehicleMutation({ variables: { id } }),
      [disableVehicleMutation]
    ),
    updateVehicleStatus: useCallback(
      (id: string, status: VehicleStatus) =>
        updateStatusMutation({ variables: { id, status } }),
      [updateStatusMutation]
    ),
    loading: creating || updating || deleting,
  };
}

/**
 * Hook for getting vehicle position from Redis
 */
export function useVehiclePosition(vehicleId: string) {
  const { updatePosition, setError } = useVehicleStore();

  const { data, loading, error } = useQuery(GET_VEHICLE_POSITION, {
    variables: { vehicleId },
    skip: !vehicleId,
    pollInterval: 1000, // Poll every second
  });

  useEffect(() => {
    if ((data as any)?.vehiclePosition) {
      updatePosition(vehicleId, (data as any).vehiclePosition);
    }
  }, [data, vehicleId, updatePosition]);

  useEffect(() => {
    if (error) {
      setError(error.message);
    }
  }, [error, setError]);

  return {
    position: (data as any)?.vehiclePosition,
    loading,
    error,
  };
}

/**
 * Hook for getting vehicle runtime state from Redis
 */
export function useVehicleRuntimeState(vehicleId: string) {
  const { updateRuntimeState, setError } = useVehicleStore();

  const { data, loading, error } = useQuery(GET_VEHICLE_RUNTIME_STATE, {
    variables: { vehicleId },
    skip: !vehicleId,
    pollInterval: 1000, // Poll every second
  });

  useEffect(() => {
    if ((data as any)?.vehicleRuntimeState) {
      updateRuntimeState(vehicleId, (data as any).vehicleRuntimeState);
    }
  }, [data, vehicleId, updateRuntimeState]);

  useEffect(() => {
    if (error) {
      setError(error.message);
    }
  }, [error, setError]);

  return {
    runtimeState: (data as any)?.vehicleRuntimeState,
    loading,
    error,
  };
}

/**
 * Hook for getting vehicles by type
 */
export function useVehiclesByType(type: VehicleType) {
  const { data, loading, error } = useQuery(GET_VEHICLES_BY_TYPE, {
    variables: { type },
  });

  return {
    vehicles: (data as any)?.vehiclesByType || [],
    loading,
    error,
  };
}

/**
 * Hook for getting enabled vehicles only
 */
export function useEnabledVehicles() {
  const { data, loading, error } = useQuery(GET_ENABLED_VEHICLES);

  return {
    vehicles: (data as any)?.enabledVehicles || [],
    loading,
    error,
  };
}
