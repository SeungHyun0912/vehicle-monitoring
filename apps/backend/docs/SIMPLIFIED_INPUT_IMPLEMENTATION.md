# SimplifiedInput Implementation - Task #1 Complete

## Overview

Task #1 from the Backend Review has been successfully implemented. This task created a simplified GraphQL API layer that bridges the gap between the frontend's flat data structures and the backend's complex domain model.

## Problem Statement

**Before**: The frontend had to send complex nested structures matching the backend's domain model:
```typescript
{
  name: "AMR-001",
  type: "AMR",
  manufacturer: "Default",
  model: "AMR-Model",
  specification: {
    maxSpeed: 2.0,
    maxLoad: 500,
    batteryCapacity: 100,
    dimensions: { length: 1.5, width: 0.8, height: 1.2 },
    weight: 200
  },
  amrSpecific: {
    lidarEnabled: true,
    cameraEnabled: true,
    ultrasonicEnabled: true,
    autonomyLevel: 3,
    mapId: "default-map",
    obstacleAvoidanceConfig: {
      enabled: true,
      minDistance: 0.5,
      detectionAngle: 180,
      avoidanceStrategy: "stop-and-replan"
    }
  }
}
```

**After**: The frontend can now send simple, flat structures:
```typescript
{
  name: "AMR-001",
  type: "AMR",
  status: "IDLE",
  isEnabled: true,
  maxSpeed: 2.0,
  batteryCapacity: 100
}
```

## Implementation Details

### 1. New Input Types

**File**: [`apps/backend/src/presentation/graphql/inputs/simplified-vehicle.input.ts`](apps/backend/src/presentation/graphql/inputs/simplified-vehicle.input.ts)

Created two new GraphQL input types:

- **SimplifiedCreateVehicleInput**: For creating vehicles with minimal required fields
  - Base fields: `name`, `type`, `status`, `isEnabled`
  - AMR-specific: `maxSpeed`, `batteryCapacity`
  - AGV-specific: `guideType`, `loadCapacity`
  - OHT-specific: `trackId`, `hoistStatus`

- **SimplifiedUpdateVehicleInput**: For updating vehicles (all fields optional)
  - Supports partial updates
  - Only provided fields are updated

### 2. Mapper Service

**File**: [`apps/backend/src/presentation/graphql/mappers/simplified-vehicle.mapper.ts`](apps/backend/src/presentation/graphql/mappers/simplified-vehicle.mapper.ts)

The `SimplifiedVehicleMapper` class provides two key methods:

#### `toCreateDto(input: SimplifiedCreateVehicleInput)`
Converts simplified input to the full backend structure by:
- Providing sensible defaults for required fields (manufacturer, model, dimensions, weight)
- Building complete specification objects from simple fields
- Generating vehicle-type-specific configurations with default values
- Supporting AMR, AGV, OHT, and FORKLIFT types

#### `toUpdateDto(input: SimplifiedUpdateVehicleInput, vehicleType: VehicleType)`
Converts simplified update input by:
- Only including fields that were actually provided (partial updates)
- Mapping frontend fields to backend structure
- Handling type-specific updates appropriately

### 3. New GraphQL Mutations

**File**: [`apps/backend/src/presentation/graphql/resolvers/vehicle.resolver.impl.ts`](apps/backend/src/presentation/graphql/resolvers/vehicle.resolver.impl.ts:177-245)

Added two new mutations to the resolver:

#### `createVehicleSimplified`
```graphql
mutation CreateVehicleSimplified($input: SimplifiedCreateVehicleInput!) {
  createVehicleSimplified(input: $input) {
    id
    name
    type
    status
    isEnabled
    # ... other fields
  }
}
```

**Implementation**:
1. Converts simplified input to full DTO using mapper
2. Creates vehicle using existing CreateVehicleUseCase
3. Sets initial status and enabled state
4. Saves the vehicle with initial state
5. Returns mapped GraphQL response

#### `updateVehicleSimplified`
```graphql
mutation UpdateVehicleSimplified($id: ID!, $input: SimplifiedUpdateVehicleInput!) {
  updateVehicleSimplified(id: $id, input: $input) {
    id
    name
    type
    status
    isEnabled
    # ... other fields
  }
}
```

**Implementation**:
1. Retrieves existing vehicle to get its type
2. Converts simplified input to update DTO
3. Handles status updates
4. Handles enable/disable state changes
5. Updates vehicle in repository
6. Returns mapped GraphQL response

### 4. Frontend Integration

**File**: [`apps/frontend/src/services/graphql/mutations.ts`](apps/frontend/src/services/graphql/mutations.ts)

Updated mutations to use the new simplified API:

- `CREATE_VEHICLE` → uses `createVehicleSimplified`
- `UPDATE_VEHICLE` → uses `updateVehicleSimplified`

The frontend's `VehicleForm` component already constructs data in the simplified format, so no changes were needed there.

## Architecture Benefits

### 1. Separation of Concerns
- **Presentation Layer**: Simple, frontend-friendly API
- **Application Layer**: Rich domain model with business logic
- **Adapter Pattern**: Mapper bridges the gap

### 2. Flexibility
- Frontend can change without affecting domain model
- Domain model can evolve without breaking frontend
- Easy to add new simplified fields

### 3. Developer Experience
- Frontend developers work with simple, intuitive structures
- Backend maintains type safety and domain integrity
- Clear documentation through GraphQL schema

### 4. Maintainability
- Centralized mapping logic in one place
- Easy to test mapper independently
- Clear separation between API contract and implementation

## Testing

### Using GraphQL Playground

Start the backend server and navigate to `http://localhost:4000/graphql`.

Test queries are provided in: [`test-simplified-mutations.graphql`](test-simplified-mutations.graphql)

#### Test 1: Create AMR
```graphql
mutation CreateAMR {
  createVehicleSimplified(input: {
    name: "AMR-TEST-001"
    type: AMR
    status: IDLE
    isEnabled: true
    maxSpeed: 2.5
    batteryCapacity: 120
  }) {
    id
    name
    type
    status
    isEnabled
  }
}
```

#### Test 2: Create AGV
```graphql
mutation CreateAGV {
  createVehicleSimplified(input: {
    name: "AGV-TEST-001"
    type: AGV
    guideType: MAGNETIC
    loadCapacity: 800
  }) {
    id
    name
    type
    ... on AGV {
      guideType
      maxLoadWeight
    }
  }
}
```

#### Test 3: Update Vehicle
```graphql
mutation UpdateVehicle($id: ID!) {
  updateVehicleSimplified(
    id: $id
    input: {
      name: "AMR-TEST-001-UPDATED"
      status: CHARGING
      maxSpeed: 3.0
    }
  ) {
    id
    name
    status
  }
}
```

### Using Frontend

1. Start the backend: `npm run dev` (in `apps/backend`)
2. Start the frontend: `npm run dev` (in `apps/frontend`)
3. Navigate to the application
4. Use the vehicle creation form - it now uses the simplified API

### Expected Behavior

✅ **Create**: Frontend sends minimal data, backend fills in defaults
✅ **Update**: Frontend sends only changed fields, backend updates partially
✅ **Type Safety**: GraphQL validates input types
✅ **Defaults**: Sensible defaults applied for missing optional fields

## Files Modified

1. **Created**:
   - `apps/backend/src/presentation/graphql/inputs/simplified-vehicle.input.ts`
   - `apps/backend/src/presentation/graphql/mappers/simplified-vehicle.mapper.ts`
   - `test-simplified-mutations.graphql`

2. **Modified**:
   - `apps/backend/src/presentation/graphql/inputs/index.ts` - Added export
   - `apps/backend/src/presentation/graphql/resolvers/vehicle.resolver.impl.ts` - Added mutations
   - `apps/frontend/src/services/graphql/mutations.ts` - Updated to use simplified mutations

## Default Values Reference

When creating vehicles with simplified input, the following defaults are applied:

### All Vehicle Types
- `manufacturer`: "Default Manufacturer"
- `model`: "{VehicleType}-Model"
- `specification.dimensions`: `{ length: 1.5, width: 0.8, height: 1.2 }`
- `specification.weight`: `200`
- `status`: `IDLE` (if not provided)
- `isEnabled`: `true` (if not provided)

### AMR Defaults
- `maxSpeed`: `2.0` m/s
- `batteryCapacity`: `100` Ah
- `amrSpecific.lidarEnabled`: `true`
- `amrSpecific.cameraEnabled`: `true`
- `amrSpecific.ultrasonicEnabled`: `true`
- `amrSpecific.autonomyLevel`: `3`
- `amrSpecific.mapId`: `"default-map"`
- Obstacle avoidance configured with safe defaults

### AGV Defaults
- `loadCapacity`: `500` kg
- `guideType`: `MAGNETIC` (if not provided)
- Line following config with standard sensitivity

### OHT Defaults
- `trackId`: `"default-rail"` (if not provided)
- Default rail segments configured

## Next Steps

With Task #1 complete, the recommended next steps are:

1. **Test with PostgreSQL and Redis**: Ensure database connections are configured
2. **Integration Testing**: Test CRUD operations end-to-end
3. **Move to Task #2**: Implement remaining P0 tasks from the backend review

## Notes

- The original complex mutations (`createVehicle`, `updateVehicle`) remain available for advanced use cases
- The simplified mutations are now the recommended way for frontend applications to interact with the API
- All validation rules from the domain model still apply
- Type-specific fields are still validated based on vehicle type

## Conclusion

Task #1 (SimplifiedInput Implementation) is **COMPLETE** ✅

The implementation successfully creates a bridge between the frontend's simple needs and the backend's complex domain model, improving developer experience while maintaining domain integrity.
