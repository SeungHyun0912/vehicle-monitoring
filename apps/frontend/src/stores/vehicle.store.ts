import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  AnyVehicle,
  Position,
  VehicleRuntimeState,
  VehicleFilter,
  WebSocketConnectionStatus,
} from '../types/vehicle.types';

/**
 * Vehicle State Interface
 */
interface VehicleState {
  // Vehicles data
  vehicles: Map<string, AnyVehicle>;
  selectedVehicleId: string | null;
  filter: VehicleFilter;

  // Real-time data (from WebSocket/Redis)
  positions: Map<string, Position>;
  runtimeStates: Map<string, VehicleRuntimeState>;

  // WebSocket connection status
  wsConnectionStatus: WebSocketConnectionStatus;

  // Loading and error states
  isLoading: boolean;
  error: string | null;

  // Actions
  setVehicles: (vehicles: AnyVehicle[]) => void;
  addVehicle: (vehicle: AnyVehicle) => void;
  updateVehicle: (id: string, vehicle: Partial<AnyVehicle>) => void;
  removeVehicle: (id: string) => void;

  setSelectedVehicleId: (id: string | null) => void;
  setFilter: (filter: VehicleFilter) => void;

  // Real-time data actions
  updatePosition: (vehicleId: string, position: Position) => void;
  updateRuntimeState: (vehicleId: string, state: VehicleRuntimeState) => void;
  updatePositions: (positions: Map<string, Position>) => void;

  // WebSocket status
  setWsConnectionStatus: (status: WebSocketConnectionStatus) => void;

  // Loading and error
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Utility methods
  getVehicleById: (id: string) => AnyVehicle | undefined;
  getFilteredVehicles: () => AnyVehicle[];
  getSelectedVehicle: () => AnyVehicle | undefined;
  getVehicleWithRealtime: (id: string) => AnyVehicle | undefined;

  // Clear all data
  clear: () => void;
}

/**
 * Vehicle Store using Zustand
 */
export const useVehicleStore = create<VehicleState>()(
  devtools(
    (set, get) => ({
      // Initial state
      vehicles: new Map(),
      selectedVehicleId: null,
      filter: {},
      positions: new Map(),
      runtimeStates: new Map(),
      wsConnectionStatus: WebSocketConnectionStatus.DISCONNECTED,
      isLoading: false,
      error: null,

      // Actions
      setVehicles: (vehicles) =>
        set(() => {
          const vehicleMap = new Map<string, AnyVehicle>();
          vehicles.forEach((vehicle) => {
            vehicleMap.set(vehicle.id, vehicle);
          });
          return { vehicles: vehicleMap };
        }),

      addVehicle: (vehicle) =>
        set((state) => {
          const newVehicles = new Map(state.vehicles);
          newVehicles.set(vehicle.id, vehicle);
          return { vehicles: newVehicles };
        }),

      updateVehicle: (id, updates) =>
        set((state) => {
          const existing = state.vehicles.get(id);
          if (!existing) return state;

          const newVehicles = new Map(state.vehicles);
          newVehicles.set(id, { ...existing, ...updates });
          return { vehicles: newVehicles };
        }),

      removeVehicle: (id) =>
        set((state) => {
          const newVehicles = new Map(state.vehicles);
          newVehicles.delete(id);

          const newPositions = new Map(state.positions);
          newPositions.delete(id);

          const newRuntimeStates = new Map(state.runtimeStates);
          newRuntimeStates.delete(id);

          return {
            vehicles: newVehicles,
            positions: newPositions,
            runtimeStates: newRuntimeStates,
            selectedVehicleId:
              state.selectedVehicleId === id ? null : state.selectedVehicleId,
          };
        }),

      setSelectedVehicleId: (id) => set({ selectedVehicleId: id }),

      setFilter: (filter) => set({ filter }),

      // Real-time data actions
      updatePosition: (vehicleId, position) =>
        set((state) => {
          const newPositions = new Map(state.positions);
          newPositions.set(vehicleId, position);
          return { positions: newPositions };
        }),

      updateRuntimeState: (vehicleId, runtimeState) =>
        set((state) => {
          const newRuntimeStates = new Map(state.runtimeStates);
          newRuntimeStates.set(vehicleId, runtimeState);
          return { runtimeStates: newRuntimeStates };
        }),

      updatePositions: (positions) => set({ positions }),

      setWsConnectionStatus: (status) => set({ wsConnectionStatus: status }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      // Utility methods
      getVehicleById: (id) => get().vehicles.get(id),

      getFilteredVehicles: () => {
        const { vehicles, filter } = get();
        const vehicleArray = Array.from(vehicles.values());

        return vehicleArray.filter((vehicle) => {
          if (filter.type && vehicle.type !== filter.type) return false;
          if (filter.status && vehicle.status !== filter.status) return false;
          if (
            filter.isEnabled !== undefined &&
            vehicle.isEnabled !== filter.isEnabled
          )
            return false;
          if (
            filter.manufacturer &&
            vehicle.manufacturer !== filter.manufacturer
          )
            return false;
          return true;
        });
      },

      getSelectedVehicle: () => {
        const { selectedVehicleId } = get();
        return selectedVehicleId ? get().vehicles.get(selectedVehicleId) : undefined;
      },

      getVehicleWithRealtime: (id) => {
        const vehicle = get().vehicles.get(id);
        if (!vehicle) return undefined;

        const position = get().positions.get(id);
        const runtimeState = get().runtimeStates.get(id);

        return {
          ...vehicle,
          position,
          runtimeState,
        };
      },

      clear: () =>
        set({
          vehicles: new Map(),
          selectedVehicleId: null,
          filter: {},
          positions: new Map(),
          runtimeStates: new Map(),
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: 'vehicle-store',
    }
  )
);
