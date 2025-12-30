import { useQuery, useMutation, useApolloClient } from '@apollo/client';
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
  AnyVehicle,
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
    onCompleted: (data) => {
      if (data?.vehicles) {
        setVehicles(data.vehicles);
      }
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  useEffect(() => {
    setLoading(loading);
  }, [loading, setLoading]);

  useEffect(() => {
    if (error) {
      setError(error.message);
    }
  }, [error, setError]);

  return {
    vehicles: data?.vehicles || [],
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
    onCompleted: (data) => {
      if (data?.vehicle) {
        updateVehicle(id, data.vehicle);
      }
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  return {
    vehicle: data?.vehicle,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook for vehicle mutations
 */
export function useVehicleMutations() {
  const client = useApolloClient();
  const { addVehicle, updateVehicle, removeVehicle, setError } =
    useVehicleStore();

  const [createVehicleMutation, { loading: creating }] = useMutation(
    CREATE_VEHICLE,
    {
      onCompleted: (data) => {
        if (data?.createVehicle) {
          addVehicle(data.createVehicle);
        }
      },
      onError: (error) => {
        setError(error.message);
      },
    }
  );

  const [updateVehicleMutation, { loading: updating }] = useMutation(
    UPDATE_VEHICLE,
    {
      onCompleted: (data) => {
        if (data?.updateVehicle) {
          updateVehicle(data.updateVehicle.id, data.updateVehicle);
        }
      },
      onError: (error) => {
        setError(error.message);
      },
    }
  );

  const [deleteVehicleMutation, { loading: deleting }] = useMutation(
    DELETE_VEHICLE,
    {
      onCompleted: (data, options) => {
        const id = options?.variables?.id;
        if (id && data?.deleteVehicle) {
          removeVehicle(id);
        }
      },
      onError: (error) => {
        setError(error.message);
      },
    }
  );

  const [enableVehicleMutation] = useMutation(ENABLE_VEHICLE, {
    onCompleted: (data) => {
      if (data?.enableVehicle) {
        updateVehicle(data.enableVehicle.id, data.enableVehicle);
      }
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const [disableVehicleMutation] = useMutation(DISABLE_VEHICLE, {
    onCompleted: (data) => {
      if (data?.disableVehicle) {
        updateVehicle(data.disableVehicle.id, data.disableVehicle);
      }
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const [updateStatusMutation] = useMutation(UPDATE_VEHICLE_STATUS, {
    onCompleted: (data) => {
      if (data?.updateVehicleStatus) {
        updateVehicle(data.updateVehicleStatus.id, data.updateVehicleStatus);
      }
    },
    onError: (error) => {
      setError(error.message);
    },
  });

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
    onCompleted: (data) => {
      if (data?.vehiclePosition) {
        updatePosition(vehicleId, data.vehiclePosition);
      }
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  return {
    position: data?.vehiclePosition,
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
    onCompleted: (data) => {
      if (data?.vehicleRuntimeState) {
        updateRuntimeState(vehicleId, data.vehicleRuntimeState);
      }
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  return {
    runtimeState: data?.vehicleRuntimeState,
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
    vehicles: data?.vehiclesByType || [],
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
    vehicles: data?.enabledVehicles || [],
    loading,
    error,
  };
}
