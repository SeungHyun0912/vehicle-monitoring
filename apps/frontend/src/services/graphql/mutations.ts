import { gql } from '@apollo/client';
import { VEHICLE_FIELDS } from './queries';

/**
 * Mutation: Create new vehicle (Simplified - Frontend Compatible)
 */
export const CREATE_VEHICLE = gql`
  mutation CreateVehicleSimplified($input: SimplifiedCreateVehicleInput!) {
    createVehicleSimplified(input: $input) {
      ...VehicleFields
      ... on AMR {
        lidarEnabled
        cameraEnabled
        autonomyLevel
        mapId
      }
      ... on AGV {
        guideType
        loadType
        maxLoadWeight
      }
      ... on OHT {
        railId
        hoistStatus
      }
    }
  }
  ${VEHICLE_FIELDS}
`;

/**
 * Mutation: Update vehicle (Simplified - Frontend Compatible)
 */
export const UPDATE_VEHICLE = gql`
  mutation UpdateVehicleSimplified($id: ID!, $input: SimplifiedUpdateVehicleInput!) {
    updateVehicleSimplified(id: $id, input: $input) {
      ...VehicleFields
    }
  }
  ${VEHICLE_FIELDS}
`;

/**
 * Mutation: Delete vehicle
 */
export const DELETE_VEHICLE = gql`
  mutation DeleteVehicle($id: ID!) {
    deleteVehicle(id: $id)
  }
`;

/**
 * Mutation: Enable vehicle
 */
export const ENABLE_VEHICLE = gql`
  mutation EnableVehicle($id: ID!) {
    enableVehicle(id: $id) {
      ...VehicleFields
    }
  }
  ${VEHICLE_FIELDS}
`;

/**
 * Mutation: Disable vehicle
 */
export const DISABLE_VEHICLE = gql`
  mutation DisableVehicle($id: ID!) {
    disableVehicle(id: $id) {
      ...VehicleFields
    }
  }
  ${VEHICLE_FIELDS}
`;

/**
 * Mutation: Update vehicle status
 */
export const UPDATE_VEHICLE_STATUS = gql`
  mutation UpdateVehicleStatus($id: ID!, $status: VehicleStatus!) {
    updateVehicleStatus(id: $id, status: $status) {
      ...VehicleFields
    }
  }
  ${VEHICLE_FIELDS}
`;
