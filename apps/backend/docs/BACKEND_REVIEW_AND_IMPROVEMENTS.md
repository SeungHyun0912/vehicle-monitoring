# Backend Review and Improvements

## 작성일: 2026-01-02

## 1. 현재 상태 분석

### 1.1 백엔드 서버 상태
- ✅ NestJS + GraphQL 구조로 구현
- ✅ CRUD API 기본 구조 완성 (vehicle.resolver.impl.ts)
- ⚠️  PostgreSQL 연결 실패 (ECONNREFUSED)
- ⚠️  Redis 인증 오류 (NOAUTH Authentication required)
- ✅ 순환 참조 문제 해결 (DimensionsType, DimensionsInput)
- ✅ Apollo Server v4로 다운그레이드 완료
- ✅ UUID v9로 다운그레이드 완료

### 1.2 CRUD API 구현 상태

#### 구현된 API
1. **Query**
   - ✅ `vehicles(filter?, pagination?)` - 차량 목록 조회
   - ✅ `vehicle(id)` - 단일 차량 조회
   - ✅ `vehiclePosition(vehicleId)` - 차량 위치 조회
   - ✅ `vehicleRuntimeState(vehicleId)` - 차량 런타임 상태 조회
   - ✅ `vehiclesByType(type)` - 타입별 차량 조회
   - ✅ `enabledVehicles()` - 활성화된 차량 조회

2. **Mutation**
   - ✅ `createVehicle(input)` - 차량 생성
   - ✅ `updateVehicle(id, input)` - 차량 수정
   - ✅ `deleteVehicle(id)` - 차량 삭제 (soft delete)
   - ✅ `enableVehicle(id)` - 차량 활성화
   - ✅ `disableVehicle(id)` - 차량 비활성화
   - ✅ `updateVehicleStatus(id, status)` - 차량 상태 업데이트

3. **Subscription**
   - ❌ 미구현 (skeleton만 존재)

## 2. 프론트엔드와 백엔드 API 불일치 문제

### 2.1 CreateVehicle Input 차이점

**프론트엔드가 전송하는 데이터** (VehicleForm.tsx:108):
```typescript
// AMR 타입 예시
{
  name: "AMR-001",
  type: "AMR",
  status: "IDLE",
  isEnabled: true,
  maxSpeed: 2.0,
  batteryCapacity: 100
}
```

**백엔드가 요구하는 데이터** (create-vehicle.input.ts:111):
```typescript
{
  name: string;
  type: VehicleType;
  manufacturer: string;  // ❌ 프론트엔드에서 누락
  model?: string;
  specification: {  // ❌ 프론트엔드에서 누락
    maxSpeed: number;
    maxLoad: number;
    batteryCapacity: number;
    dimensions?: { length, width, height };
    weight?: number;
  };
  amrSpecific?: {  // ❌ 프론트엔드 구조와 다름
    lidarEnabled: boolean;
    cameraEnabled: boolean;
    ultrasonicEnabled: boolean;
    autonomyLevel: number;
    mapId?: string;
    obstacleAvoidanceConfig: { ... };
  };
}
```

### 2.2 UpdateVehicle Input 차이점

**프론트엔드가 전송하는 데이터**:
```typescript
{
  name: "AMR-001-Updated",
  type: "AMR",  // ❌ 백엔드는 type 수정 불가
  status: "MOVING",
  isEnabled: true,
  maxSpeed: 2.5,
  batteryCapacity: 100
}
```

**백엔드가 요구하는 데이터** (update-vehicle.input.ts:7):
```typescript
{
  name?: string;
  model?: string;
  status?: VehicleStatus;
  specification?: VehicleSpecificationInput;
  // ❌ type, isEnabled, vehicle-specific fields 수정 불가
}
```

## 3. 개선 사항

### 3.1 즉시 필요한 개선 (Critical)

#### A. Simplified Input Types 추가
프론트엔드 호환성을 위한 간소화된 Input 타입 생성:

**파일**: `src/presentation/graphql/inputs/simplified-vehicle.input.ts`
```typescript
@InputType()
export class SimplifiedCreateVehicleInput {
  @Field()
  name: string;

  @Field(() => VehicleType)
  type: VehicleType;

  @Field(() => VehicleStatus, { defaultValue: VehicleStatus.IDLE })
  status?: VehicleStatus = VehicleStatus.IDLE;

  @Field({ defaultValue: true })
  isEnabled?: boolean = true;

  // AMR specific (optional)
  @Field({ nullable: true })
  maxSpeed?: number;

  @Field({ nullable: true })
  batteryCapacity?: number;

  // AGV specific (optional)
  @Field(() => GuideType, { nullable: true })
  guideType?: GuideType;

  @Field({ nullable: true })
  loadCapacity?: number;

  // OHT specific (optional)
  @Field(() => OHTHoistStatus, { nullable: true })
  hoistStatus?: OHTHoistStatus;

  @Field({ nullable: true })
  trackId?: string;
}

@InputType()
export class SimplifiedUpdateVehicleInput {
  @Field({ nullable: true })
  name?: string;

  @Field(() => VehicleStatus, { nullable: true })
  status?: VehicleStatus;

  @Field({ nullable: true })
  isEnabled?: boolean;

  // Vehicle type specific fields
  @Field({ nullable: true })
  maxSpeed?: number;

  @Field({ nullable: true })
  batteryCapacity?: number;

  @Field(() => GuideType, { nullable: true })
  guideType?: GuideType;

  @Field({ nullable: true })
  loadCapacity?: number;

  @Field(() => OHTHoistStatus, { nullable: true })
  hoistStatus?: OHTHoistStatus;

  @Field({ nullable: true })
  trackId?: string;
}
```

#### B. Simplified Mutations 추가
```typescript
@Mutation(() => VehicleInterface)
async createVehicleSimplified(
  @Args('input') input: SimplifiedCreateVehicleInput,
): Promise<any> {
  // SimplifiedInput을 CreateVehicleInput으로 변환
  const fullInput = this.mapSimplifiedToFull(input);
  return this.createVehicleUseCase.execute(fullInput);
}

@Mutation(() => VehicleInterface)
async updateVehicleSimplified(
  @Args('id', { type: () => ID }) id: string,
  @Args('input') input: SimplifiedUpdateVehicleInput,
): Promise<any> {
  // SimplifiedInput을 UpdateVehicleInput으로 변환
  return this.vehicleRepository.update(id, input as any);
}
```

### 3.2 인프라 개선 (High Priority)

#### A. 데이터베이스 연결 문제 해결
**문제**: PostgreSQL 연결 실패
**해결책**:
1. `.env` 파일의 DB 설정 확인
2. PostgreSQL 서비스 시작: `brew services start postgresql`
3. 데이터베이스 생성: `createdb vehicle_monitoring`

#### B. Redis 인증 문제 해결
**문제**: Redis NOAUTH 오류
**해결책**:
1. `.env` 파일에 Redis 비밀번호 설정
2. 또는 Redis 비밀번호 제거: `redis-cli CONFIG SET requirepass ""`

### 3.3 아키텍처 개선 (Medium Priority)

#### A. UpdateVehicle 로직 개선
현재 `updateVehicle`은 `vehicle-specific` 필드 수정을 지원하지 않음.

**개선안**:
```typescript
// UpdateVehicleInput에 vehicle-specific 필드 추가
@InputType()
export class UpdateVehicleInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  model?: string;

  @Field(() => VehicleStatus, { nullable: true })
  status?: VehicleStatus;

  @Field(() => VehicleSpecificationInput, { nullable: true })
  specification?: VehicleSpecificationInput;

  // 추가: vehicle-specific updates
  @Field(() => UpdateAMRSpecificInput, { nullable: true })
  amrSpecific?: UpdateAMRSpecificInput;

  @Field(() => UpdateAGVSpecificInput, { nullable: true })
  agvSpecific?: UpdateAGVSpecificInput;

  @Field(() => UpdateOHTSpecificInput, { nullable: true })
  ohtSpecific?: UpdateOHTSpecificInput;
}
```

#### B. Validation 강화
```typescript
// CreateVehicleInput에 type-specific validation 추가
@ValidateIf(o => o.type === VehicleType.AMR)
@IsNotEmpty({ message: 'AMR requires maxSpeed' })
@Field({ nullable: true })
maxSpeed?: number;
```

#### C. 에러 처리 개선
```typescript
// Custom GraphQL Error Types
export class VehicleNotFoundError extends Error {
  constructor(id: string) {
    super(`Vehicle with id ${id} not found`);
  }
}

// Resolver에서 사용
@Mutation(() => VehicleInterface)
async updateVehicle(...) {
  const vehicle = await this.getVehicleUseCase.execute(id);
  if (!vehicle) {
    throw new VehicleNotFoundError(id);
  }
  // ...
}
```

### 3.4 기능 개선 (Low Priority)

#### A. GraphQL Subscription 구현
실시간 차량 위치 및 상태 업데이트를 위한 Subscription 구현:
```typescript
@Subscription(() => VehiclePositionUpdateType)
vehiclePositionUpdated(
  @Args('vehicleId', { nullable: true }) vehicleId?: string,
) {
  return this.pubSub.asyncIterator(
    vehicleId ? `position.${vehicleId}` : 'position.*'
  );
}
```

#### B. Pagination 구현
대량의 차량 데이터 처리를 위한 커서 기반 페이지네이션:
```typescript
@ObjectType()
class VehicleConnection {
  @Field(() => [VehicleEdge])
  edges: VehicleEdge[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
```

#### C. Caching 전략
Redis를 활용한 GraphQL query caching:
```typescript
@Query(() => [VehicleInterface], {
  name: 'vehicles',
  // Apollo Server cache hint
  complexity: 10,
})
@UseInterceptors(CacheInterceptor)
@CacheTTL(60) // 60초 캐싱
async getVehicles(...) { ... }
```

## 4. 보안 개선사항

### 4.1 인증/인가
- [ ] GraphQL API에 JWT 인증 추가
- [ ] Role-based access control (RBAC)
- [ ] Mutation에 대한 권한 검증

### 4.2 Input Validation
- [ ] GraphQL input sanitization
- [ ] SQL Injection 방지 (TypeORM이 기본 제공)
- [ ] XSS 방지

### 4.3 Rate Limiting
- [ ] GraphQL query complexity analysis
- [ ] IP-based rate limiting
- [ ] Cost analysis for expensive queries

## 5. 테스트 개선사항

### 5.1 Unit Tests
- [ ] Resolver unit tests
- [ ] Use case unit tests
- [ ] Repository unit tests

### 5.2 Integration Tests
- [ ] GraphQL query/mutation tests
- [ ] Database integration tests
- [ ] Redis integration tests

### 5.3 E2E Tests
- [ ] Full CRUD workflow tests
- [ ] WebSocket subscription tests

## 6. 모니터링 및 로깅

### 6.1 APM (Application Performance Monitoring)
- [ ] GraphQL query performance tracking
- [ ] Slow query detection
- [ ] Error tracking (e.g., Sentry)

### 6.2 Structured Logging
```typescript
// Winston logger setup
logger.info('Vehicle created', {
  vehicleId: vehicle.id,
  type: vehicle.type,
  userId: context.user.id,
});
```

### 6.3 Metrics
- [ ] Prometheus metrics export
- [ ] Grafana dashboard
- [ ] Custom business metrics

## 7. 우선순위 요약

### P0 (즉시 실행)
1. ✅ Apollo Server 호환성 문제 해결
2. ✅ 순환 참조 문제 해결
3. ⚠️  PostgreSQL 연결 설정
4. ⚠️  Redis 인증 설정
5. 🔄 Simplified Input Types 추가 (프론트엔드 호환성)

### P1 (1주일 내)
1. UpdateVehicle vehicle-specific 필드 지원
2. 에러 처리 개선
3. Input validation 강화
4. Unit test 작성

### P2 (2주일 내)
1. GraphQL Subscription 구현
2. Pagination 구현
3. Caching 전략 구현
4. Integration tests

### P3 (1개월 내)
1. 인증/인가 구현
2. Rate limiting
3. APM 설정
4. E2E tests

## 8. 기술 부채 (Technical Debt)

### 8.1 현재 기술 부채
1. **Any 타입 남용**: `vehicle.resolver.impl.ts`에서 많은 `as any` 사용
2. **Type Safety 부족**: GraphQL mapper에서 타입 검증 부족
3. **에러 처리 미흡**: 대부분의 에러가 generic Error로 처리됨
4. **테스트 부재**: 모든 레이어에서 테스트 코드 부재

### 8.2 해결 계획
1. Type-safe GraphQL mapper 구현
2. Custom error classes 정의
3. Test coverage 80% 이상 달성
4. TypeScript strict mode 활성화

## 9. 다음 단계

1. **SimplifiedInput 구현** (1-2시간)
   - simplified-vehicle.input.ts 생성
   - Resolver에 simplified mutations 추가
   - 프론트엔드와 통합 테스트

2. **인프라 설정** (30분)
   - PostgreSQL 시작 및 DB 생성
   - Redis 인증 설정
   - 연결 테스트

3. **기본 테스트 작성** (2-3시간)
   - CRUD mutation tests
   - Query tests
   - Integration tests

4. **문서화** (1시간)
   - API 문서 생성
   - Setup guide 작성
   - Troubleshooting guide
