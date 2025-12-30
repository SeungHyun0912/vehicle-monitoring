import { gql } from '@apollo/client';

/**
 * Fragment for common vehicle fields
 */
export const VEHICLE_FIELDS = gql`
  fragment VehicleFields on Vehicle {
    id
    name
    type
    manufacturer
    model
    status
    isEnabled
    createdAt
    updatedAt
  }
`;

/**
 * Fragment for AMR specific fields
 */
export const AMR_FIELDS = gql`
  fragment AMRFields on AMR {
    ...VehicleFields
    lidarEnabled
    cameraEnabled
    ultrasonicEnabled
    autonomyLevel
    mapId
    obstacleAvoidanceConfig {
      enabled
      minDistance
      detectionAngle
      avoidanceStrategy
    }
  }
  ${VEHICLE_FIELDS}
`;

/**
 * Fragment for AGV specific fields
 */
export const AGV_FIELDS = gql`
  fragment AGVFields on AGV {
    ...VehicleFields
    guideType
    lineFollowingConfig {
      sensorCount
      lineWidth
      followingSpeed
    }
    loadType
    maxLoadWeight
  }
  ${VEHICLE_FIELDS}
`;

/**
 * Fragment for OHT specific fields
 */
export const OHT_FIELDS = gql`
  fragment OHTFields on OHT {
    ...VehicleFields
    railId
    hoistStatus
    railPosition
    railSegments
  }
  ${VEHICLE_FIELDS}
`;

/**
 * Query: Get all vehicles with optional filter
 */
export const GET_VEHICLES = gql`
  query GetVehicles($filter: VehicleFilterInput) {
    vehicles(filter: $filter) {
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
        railPosition
      }
    }
  }
  ${VEHICLE_FIELDS}
`;

/**
 * Query: Get single vehicle by ID
 */
export const GET_VEHICLE = gql`
  query GetVehicle($id: ID!) {
    vehicle(id: $id) {
      ...VehicleFields
      ... on AMR {
        ...AMRFields
      }
      ... on AGV {
        ...AGVFields
      }
      ... on OHT {
        ...OHTFields
      }
    }
  }
  ${VEHICLE_FIELDS}
  ${AMR_FIELDS}
  ${AGV_FIELDS}
  ${OHT_FIELDS}
`;

/**
 * Query: Get vehicle position from Redis
 */
export const GET_VEHICLE_POSITION = gql`
  query GetVehiclePosition($vehicleId: ID!) {
    vehiclePosition(vehicleId: $vehicleId) {
      x
      y
      z
      heading
      timestamp
      mapId
    }
  }
`;

/**
 * Query: Get vehicle runtime state from Redis
 */
export const GET_VEHICLE_RUNTIME_STATE = gql`
  query GetVehicleRuntimeState($vehicleId: ID!) {
    vehicleRuntimeState(vehicleId: $vehicleId) {
      currentSpeed
      batteryLevel
      currentLoad
      temperature
      errorCodes
      lastUpdateTime
    }
  }
`;

/**
 * Query: Get vehicles by type
 */
export const GET_VEHICLES_BY_TYPE = gql`
  query GetVehiclesByType($type: VehicleType!) {
    vehiclesByType(type: $type) {
      ...VehicleFields
    }
  }
  ${VEHICLE_FIELDS}
`;

/**
 * Query: Get enabled vehicles only
 */
export const GET_ENABLED_VEHICLES = gql`
  query GetEnabledVehicles {
    enabledVehicles {
      ...VehicleFields
    }
  }
  ${VEHICLE_FIELDS}
`;
