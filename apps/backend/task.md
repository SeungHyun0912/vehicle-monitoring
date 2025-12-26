# Vehicle Monitoring Backend - Task List

## 1. 자율 주행 로봇 Entity 설계 및 GraphQL 구현

### 1.1 Domain Layer - Entity 설계

#### 1.1.1 Vehicle Base Entity
- [ ] Vehicle 추상 클래스 설계
  - [ ] 공통 속성: id (UUID), name, type, manufacturer, model
  - [ ] 상태 속성: status (IDLE, MOVING, CHARGING, ERROR, STOPPED, MAINTENANCE)
  - [ ] 메타 정보: createdAt, updatedAt, deletedAt (soft delete)
  - [ ] 활성화 상태: isEnabled (boolean)
  - [ ] 설정 정보: maxSpeed, maxLoad, batteryCapacity
- [ ] Value Objects 정의
  - [ ] VehicleType (AMR, AGV, OHT, FORKLIFT, etc.)
  - [ ] Manufacturer (제조사 정보)
  - [ ] VehicleStatus (상태 enum)
  - [ ] VehicleSpecification (사양 정보)

#### 1.1.2 Vehicle Type별 Entity 구현
- [ ] AMR (Autonomous Mobile Robot) Entity
  - [ ] 센서 정보: lidarEnabled, cameraEnabled, ultrasonicEnabled
  - [ ] 자율 주행 레벨: autonomyLevel
  - [ ] 매핑 데이터 참조: mapId
  - [ ] 장애물 회피 설정: obstacleAvoidanceConfig
- [ ] AGV (Automated Guided Vehicle) Entity
  - [ ] 가이드 타입: guideType (MAGNETIC, LASER, WIRE, VISION)
  - [ ] 라인 팔로잉 설정: lineFollowingConfig
  - [ ] 적재 타입: loadType
  - [ ] 최대 적재량: maxLoadWeight
- [ ] OHT (Overhead Hoist Transport) Entity
  - [ ] 레일 ID: railId
  - [ ] 호이스트 상태: hoistStatus (UP, DOWN, MOVING)
  - [ ] 레일 위치: railPosition
  - [ ] 이동 범위: railSegments[]

#### 1.1.3 위치 및 상태 정보 Entity (Redis 매핑용)
- [ ] VehiclePosition Value Object
  - [ ] x, y, z 좌표 (number)
  - [ ] rotation (quaternion: x, y, z, w) 또는 euler (roll, pitch, yaw)
  - [ ] heading (방향각, degree)
  - [ ] timestamp (업데이트 시각)
  - [ ] mapId (맵 참조)
- [ ] VehicleRuntimeState Value Object
  - [ ] currentSpeed (현재 속도)
  - [ ] batteryLevel (배터리 잔량, %)
  - [ ] currentLoad (현재 적재량)
  - [ ] temperature (온도)
  - [ ] errorCodes (에러 코드 배열)
  - [ ] lastUpdateTime (마지막 업데이트 시각)

#### 1.1.4 Entity-Redis 매핑 관계
- [ ] VehicleRedisMapping Entity
  - [ ] vehicleId (DB Entity ID)
  - [ ] redisKey (Redis에서의 키)
  - [ ] lastSyncTime (마지막 동기화 시각)
  - [ ] syncStatus (SYNCED, OUT_OF_SYNC, ERROR)
  - [ ] connectionStatus (CONNECTED, DISCONNECTED, TIMEOUT)

### 1.2 GraphQL Schema 설계

#### 1.2.1 GraphQL Types 정의
- [ ] Vehicle Interface (공통 인터페이스)
  ```graphql
  interface Vehicle {
    id: ID!
    name: String!
    type: VehicleType!
    manufacturer: String!
    model: String
    status: VehicleStatus!
    isEnabled: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }
  ```
- [ ] AMR Type
  ```graphql
  type AMR implements Vehicle {
    # Vehicle 필드들
    lidarEnabled: Boolean!
    cameraEnabled: Boolean!
    autonomyLevel: Int!
    mapId: String
  }
  ```
- [ ] AGV Type (유사하게 정의)
- [ ] OHT Type (유사하게 정의)
- [ ] VehiclePosition Type
  ```graphql
  type VehiclePosition {
    x: Float!
    y: Float!
    z: Float!
    heading: Float!
    rotation: Quaternion
    timestamp: DateTime!
  }
  ```
- [ ] VehicleRuntimeState Type
  ```graphql
  type VehicleRuntimeState {
    currentSpeed: Float!
    batteryLevel: Float!
    currentLoad: Float
    temperature: Float
    errorCodes: [String!]
    lastUpdateTime: DateTime!
  }
  ```

#### 1.2.2 GraphQL Queries
- [ ] `vehicles(filter: VehicleFilter, pagination: Pagination): VehicleConnection!`
  - [ ] 전체 차량 목록 조회 (페이지네이션)
  - [ ] 타입별 필터링
  - [ ] 상태별 필터링
  - [ ] 활성화 여부 필터링
- [ ] `vehicle(id: ID!): Vehicle`
  - [ ] 특정 차량 상세 조회
- [ ] `vehiclePosition(vehicleId: ID!): VehiclePosition`
  - [ ] 특정 차량의 현재 위치 조회
- [ ] `vehicleRuntimeState(vehicleId: ID!): VehicleRuntimeState`
  - [ ] 특정 차량의 실시간 상태 조회
- [ ] `vehiclesByType(type: VehicleType!): [Vehicle!]!`
  - [ ] 타입별 차량 목록
- [ ] `enabledVehicles: [Vehicle!]!`
  - [ ] 활성화된 차량만 조회

#### 1.2.3 GraphQL Mutations
- [ ] `createVehicle(input: CreateVehicleInput!): Vehicle!`
  - [ ] 신규 차량 등록
  - [ ] 타입별 세부 정보 입력
- [ ] `updateVehicle(id: ID!, input: UpdateVehicleInput!): Vehicle!`
  - [ ] 차량 정보 수정
- [ ] `deleteVehicle(id: ID!): Boolean!`
  - [ ] 차량 삭제 (soft delete)
- [ ] `enableVehicle(id: ID!): Vehicle!`
  - [ ] 차량 활성화
- [ ] `disableVehicle(id: ID!): Vehicle!`
  - [ ] 차량 비활성화
- [ ] `updateVehicleStatus(id: ID!, status: VehicleStatus!): Vehicle!`
  - [ ] 차량 상태 변경

#### 1.2.4 GraphQL Subscriptions
- [ ] `vehiclePositionUpdated(vehicleId: ID): VehiclePositionUpdate!`
  - [ ] 특정 차량 또는 전체 차량의 위치 업데이트 구독
- [ ] `vehicleStateChanged(vehicleId: ID): VehicleStateChange!`
  - [ ] 차량 상태 변경 구독
- [ ] `vehicleAdded: Vehicle!`
  - [ ] 신규 차량 추가 이벤트
- [ ] `vehicleRemoved(id: ID!): ID!`
  - [ ] 차량 제거 이벤트

### 1.3 Repository Interface 정의 (Domain Layer)
- [ ] IVehicleRepository
  - [ ] `findById(id: string): Promise<Vehicle | null>`
  - [ ] `findAll(filter?: VehicleFilter): Promise<Vehicle[]>`
  - [ ] `findByType(type: VehicleType): Promise<Vehicle[]>`
  - [ ] `findEnabledVehicles(): Promise<Vehicle[]>`
  - [ ] `create(vehicle: Vehicle): Promise<Vehicle>`
  - [ ] `update(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle>`
  - [ ] `delete(id: string): Promise<void>`
  - [ ] `enable(id: string): Promise<Vehicle>`
  - [ ] `disable(id: string): Promise<Vehicle>`

## 2. Redis 연동 및 실시간 데이터 처리

### 2.1 Redis Infrastructure 구성

#### 2.1.1 Redis 연결 설정
- [ ] Redis Module 설정
  - [ ] `@nestjs/redis` 또는 `ioredis` 설치
  - [ ] Redis 연결 설정 (host, port, password, db)
  - [ ] Connection Pool 설정
  - [ ] Retry 전략 설정
  - [ ] Health Check 구현
- [ ] Redis Configuration
  - [ ] 환경변수 기반 설정
  - [ ] 다중 Redis 인스턴스 지원 (클러스터)
  - [ ] Sentinel 모드 지원 (고가용성)

#### 2.1.2 ROS2 데이터 구조 분석 및 매핑
- [ ] ROS2 메시지 포맷 파싱
  - [ ] geometry_msgs/PoseStamped 파싱
  - [ ] nav_msgs/Odometry 파싱
  - [ ] sensor_msgs 파싱 (필요 시)
- [ ] Redis Key 스키마 설계
  - [ ] `vehicle:{vehicleId}:position` - 위치 정보
  - [ ] `vehicle:{vehicleId}:state` - 상태 정보
  - [ ] `vehicle:{vehicleId}:last_update` - 마지막 업데이트 시각
  - [ ] `vehicles:active` (Set) - 활성 차량 ID 목록
  - [ ] `vehicles:positions` (Geo Hash) - 공간 인덱싱
- [ ] 데이터 구조 정의
  ```typescript
  interface RedisPositionData {
    x: number;
    y: number;
    z: number;
    qx: number; // quaternion
    qy: number;
    qz: number;
    qw: number;
    timestamp: number;
    frame_id: string;
  }
  ```

#### 2.1.3 Redis Repository 구현
- [ ] RedisVehiclePositionRepository
  - [ ] `getPosition(vehicleId: string): Promise<VehiclePosition | null>`
  - [ ] `setPosition(vehicleId: string, position: VehiclePosition): Promise<void>`
  - [ ] `getPositions(vehicleIds: string[]): Promise<Map<string, VehiclePosition>>`
  - [ ] `getAllActivePositions(): Promise<Map<string, VehiclePosition>>`
  - [ ] `subscribeToPositionUpdates(callback): Subscription`
- [ ] RedisVehicleStateRepository
  - [ ] `getState(vehicleId: string): Promise<VehicleRuntimeState | null>`
  - [ ] `setState(vehicleId: string, state: VehicleRuntimeState): Promise<void>`
  - [ ] `subscribeToStateUpdates(callback): Subscription`

### 2.2 실시간 데이터 동기화

#### 2.2.1 Redis Pub/Sub 구현
- [ ] Publisher 설정
  - [ ] ROS2 -> Redis 데이터 발행 (외부 시스템)
- [ ] Subscriber 구현
  - [ ] Redis Pub/Sub 채널 구독
  - [ ] 채널 정의: `vehicle:position:update`, `vehicle:state:update`
  - [ ] 메시지 파싱 및 검증
  - [ ] 에러 핸들링 및 재구독

#### 2.2.2 Entity-Redis 매핑 서비스
- [ ] VehicleSyncService 구현
  - [ ] `syncVehiclePosition(vehicleId: string): Promise<void>`
    - DB에서 Vehicle Entity 조회
    - Redis에서 위치 정보 조회
    - 매핑 및 캐싱
  - [ ] `syncAllEnabledVehicles(): Promise<void>`
    - 활성화된 모든 차량 동기화
  - [ ] `startAutoSync(interval: number): void`
    - 주기적 자동 동기화 (예: 1초마다)
  - [ ] `stopAutoSync(): void`
- [ ] VehicleMappingService 구현
  - [ ] `mapVehicleToRedis(vehicle: Vehicle): Promise<void>`
    - DB Entity와 Redis Key 매핑 생성
  - [ ] `unmapVehicleFromRedis(vehicleId: string): Promise<void>`
    - 매핑 제거
  - [ ] `getMappingStatus(vehicleId: string): Promise<MappingStatus>`
    - 매핑 상태 확인
  - [ ] `validateMapping(vehicleId: string): Promise<boolean>`
    - 매핑 유효성 검증

#### 2.2.3 데이터 캐싱 전략
- [ ] In-Memory 캐싱
  - [ ] NestJS Cache Manager 설정
  - [ ] 위치 정보 캐싱 (TTL: 1초)
  - [ ] 상태 정보 캐싱 (TTL: 5초)
- [ ] Cache Invalidation
  - [ ] Redis 업데이트 시 캐시 무효화
  - [ ] 수동 캐시 클리어 API

#### 2.2.4 실시간 모니터링 및 검증
- [ ] 데이터 신선도 검증
  - [ ] Timestamp 기반 데이터 유효성 검사
  - [ ] Stale 데이터 감지 (예: 5초 이상 업데이트 없음)
  - [ ] 연결 끊김 감지 및 알림
- [ ] 데이터 정합성 검증
  - [ ] Position 값 범위 검증
  - [ ] Quaternion 정규화 검증
  - [ ] 비정상 값 필터링

### 2.3 WebSocket을 통한 클라이언트 전송

#### 2.3.1 WebSocket Gateway 구현
- [ ] VehiclePositionGateway
  - [ ] `@WebSocketGateway()` 데코레이터 설정
  - [ ] CORS 설정
  - [ ] 인증/인가 미들웨어 (JWT 토큰 검증)
- [ ] 연결 관리
  - [ ] `handleConnection(client: Socket): void`
    - 클라이언트 연결 시 처리
    - 연결된 클라이언트 추적
  - [ ] `handleDisconnect(client: Socket): void`
    - 연결 해제 시 정리
  - [ ] Heartbeat 구현 (ping/pong)

#### 2.3.2 이벤트 핸들러 구현
- [ ] 클라이언트 -> 서버 이벤트
  - [ ] `subscribeVehicle(vehicleId: string)`
    - 특정 차량 구독
  - [ ] `unsubscribeVehicle(vehicleId: string)`
    - 구독 해제
  - [ ] `subscribeAll()`
    - 전체 차량 구독
  - [ ] `unsubscribeAll()`
    - 전체 구독 해제
- [ ] 서버 -> 클라이언트 이벤트
  - [ ] `positionUpdate`
    ```typescript
    {
      vehicleId: string;
      position: VehiclePosition;
      state: VehicleRuntimeState;
    }
    ```
  - [ ] `stateChange`
    ```typescript
    {
      vehicleId: string;
      oldStatus: VehicleStatus;
      newStatus: VehicleStatus;
    }
    ```
  - [ ] `vehicleError`
    ```typescript
    {
      vehicleId: string;
      errorCode: string;
      message: string;
    }
    ```

#### 2.3.3 브로드캐스팅 전략
- [ ] Room 기반 구독 관리
  - [ ] `vehicle:{vehicleId}` 룸 생성
  - [ ] `all-vehicles` 룸 (전체 구독)
  - [ ] 타입별 룸: `type:AMR`, `type:AGV` 등
- [ ] 선택적 브로드캐스팅
  - [ ] 구독한 차량의 업데이트만 전송
  - [ ] 필터링 조건 적용 (예: 이동 중인 차량만)
- [ ] 성능 최적화
  - [ ] Throttling (예: 100ms마다 최대 1회 전송)
  - [ ] Batching (여러 업데이트를 묶어서 전송)
  - [ ] Delta Updates (변경된 값만 전송)

#### 2.3.4 Redis Pub/Sub -> WebSocket 브리지
- [ ] RedisToWebSocketBridge 서비스
  - [ ] Redis 구독자 생성
  - [ ] Redis 메시지 수신
  - [ ] WebSocket으로 메시지 변환 및 브로드캐스트
  - [ ] 에러 핸들링 및 재연결
  ```typescript
  @Injectable()
  class RedisToWebSocketBridge {
    async onRedisMessage(channel: string, message: string) {
      const data = JSON.parse(message);
      const vehicleId = data.vehicleId;

      // WebSocket으로 브로드캐스트
      this.gateway.server
        .to(`vehicle:${vehicleId}`)
        .emit('positionUpdate', data);
    }
  }
  ```

### 2.4 Application Layer - Use Cases

#### 2.4.1 Vehicle Management Use Cases
- [ ] CreateVehicleUseCase
  - [ ] 입력 검증
  - [ ] Vehicle Entity 생성
  - [ ] DB 저장
  - [ ] Redis 매핑 생성
- [ ] EnableVehicleUseCase
  - [ ] Vehicle 활성화
  - [ ] Redis 동기화 시작
  - [ ] WebSocket 구독 가능 상태로 전환
- [ ] DisableVehicleUseCase
  - [ ] Vehicle 비활성화
  - [ ] Redis 동기화 중단
  - [ ] WebSocket 구독 정리

#### 2.4.2 Real-time Data Use Cases
- [ ] GetVehiclePositionUseCase
  - [ ] Redis에서 위치 정보 조회
  - [ ] Entity와 매핑
  - [ ] 응답 반환
- [ ] StreamVehiclePositionsUseCase
  - [ ] 활성화된 차량 목록 조회
  - [ ] Redis Pub/Sub 구독
  - [ ] WebSocket으로 스트리밍
- [ ] SyncVehicleDataUseCase
  - [ ] Entity와 Redis 데이터 동기화
  - [ ] 데이터 정합성 검증
  - [ ] 불일치 시 알림

## 3. Infrastructure Layer 구현

### 3.1 Database Repository 구현
- [ ] TypeORM 설정
  - [ ] Entity 매핑
  - [ ] Migration 파일 생성
  - [ ] Seeding 데이터 준비
- [ ] VehicleRepository 구현 (TypeORM)
  - [ ] 모든 IVehicleRepository 메서드 구현
  - [ ] Query 최적화 (인덱싱, Eager Loading)
  - [ ] Soft Delete 처리

### 3.2 Redis Repository 구현
- [ ] RedisModule 설정
- [ ] RedisVehiclePositionRepository 구현
- [ ] RedisVehicleStateRepository 구현
- [ ] Redis 트랜잭션 처리 (MULTI/EXEC)

### 3.3 외부 시스템 연동
- [ ] ROS2 Bridge (선택사항)
  - [ ] ROS2 메시지를 Redis로 발행하는 별도 서비스
  - [ ] rclnodejs 또는 rosbridge 사용
- [ ] Health Check
  - [ ] Redis 연결 상태 체크
  - [ ] DB 연결 상태 체크
  - [ ] ROS2 연결 상태 체크 (해당되는 경우)

## 4. Presentation Layer 구현

### 4.1 GraphQL Resolvers
- [ ] VehicleResolver
  - [ ] Query Resolvers
  - [ ] Mutation Resolvers
  - [ ] Subscription Resolvers
  - [ ] Field Resolvers (nested resolvers)
- [ ] DTO 변환
  - [ ] Entity -> GraphQL Type 변환
  - [ ] Input -> Entity 변환

### 4.2 REST API (보조적)
- [ ] VehicleController
  - [ ] GET `/api/vehicles` - 차량 목록
  - [ ] GET `/api/vehicles/:id` - 차량 상세
  - [ ] POST `/api/vehicles` - 차량 생성
  - [ ] PUT `/api/vehicles/:id` - 차량 수정
  - [ ] DELETE `/api/vehicles/:id` - 차량 삭제
  - [ ] POST `/api/vehicles/:id/enable` - 차량 활성화
  - [ ] POST `/api/vehicles/:id/disable` - 차량 비활성화
- [ ] PositionController
  - [ ] GET `/api/vehicles/:id/position` - 현재 위치
  - [ ] GET `/api/vehicles/:id/state` - 현재 상태

### 4.3 Exception Filters
- [ ] GraphQLExceptionFilter
  - [ ] 에러 타입별 처리
  - [ ] 클라이언트 친화적 메시지 변환
- [ ] WebSocketExceptionFilter
  - [ ] WebSocket 에러 처리
  - [ ] 연결 에러 핸들링

## 5. 보안 및 인증

### 5.1 인증/인가
- [ ] JWT 기반 인증
  - [ ] 토큰 발급 (로그인)
  - [ ] 토큰 검증 (Guard)
  - [ ] Refresh Token 처리
- [ ] GraphQL 인증
  - [ ] Context에서 사용자 정보 주입
  - [ ] @UseGuards() 데코레이터 적용
- [ ] WebSocket 인증
  - [ ] Handshake 시 토큰 검증
  - [ ] 연결 거부 처리

### 5.2 권한 관리
- [ ] Role-based Access Control (RBAC)
  - [ ] 역할 정의: ADMIN, OPERATOR, VIEWER
  - [ ] 권한 체크 Guard 구현
- [ ] Resource-level 권한
  - [ ] 차량별 접근 권한
  - [ ] 조직/그룹별 권한

### 5.3 보안 강화
- [ ] Rate Limiting
  - [ ] API 요청 제한
  - [ ] WebSocket 연결 제한
- [ ] Input Validation
  - [ ] class-validator 사용
  - [ ] DTO 검증
- [ ] SQL Injection 방지
  - [ ] Parameterized Query 사용
  - [ ] ORM 사용

## 6. 모니터링 및 로깅

### 6.1 로깅
- [ ] Logger 설정
  - [ ] Winston 또는 Pino 설정
  - [ ] 로그 레벨 설정
  - [ ] 파일 로그, 콘솔 로그
- [ ] 구조화된 로깅
  - [ ] Context 정보 포함
  - [ ] Request ID 추적
  - [ ] 에러 스택 트레이스

### 6.2 메트릭 수집
- [ ] Prometheus 연동
  - [ ] 메트릭 수집 엔드포인트
  - [ ] Custom 메트릭 정의
    - 활성 차량 수
    - WebSocket 연결 수
    - Redis 동기화 지연 시간
    - GraphQL 쿼리 응답 시간

### 6.3 Health Check
- [ ] Health Check 엔드포인트
  - [ ] `/health` - 전체 상태
  - [ ] `/health/db` - DB 상태
  - [ ] `/health/redis` - Redis 상태
  - [ ] `/health/websocket` - WebSocket 상태

### 6.4 분산 추적 (선택사항)
- [ ] OpenTelemetry 설정
  - [ ] Trace 수집
  - [ ] Span 생성
  - [ ] Jaeger/Zipkin 연동

## 7. 테스트

### 7.1 단위 테스트
- [ ] Entity 테스트
  - [ ] Value Object 검증
  - [ ] 비즈니스 로직 검증
- [ ] Use Case 테스트
  - [ ] Mock Repository 사용
  - [ ] 시나리오별 테스트
- [ ] Repository 테스트
  - [ ] In-Memory DB 사용
  - [ ] CRUD 동작 검증

### 7.2 통합 테스트
- [ ] GraphQL API 테스트
  - [ ] Query 테스트
  - [ ] Mutation 테스트
  - [ ] Subscription 테스트
- [ ] Redis 연동 테스트
  - [ ] Pub/Sub 테스트
  - [ ] 데이터 동기화 테스트
- [ ] WebSocket 테스트
  - [ ] 연결 테스트
  - [ ] 메시지 송수신 테스트

### 7.3 E2E 테스트
- [ ] 전체 플로우 테스트
  - [ ] 차량 생성 -> 활성화 -> 위치 스트리밍
  - [ ] Redis 업데이트 -> WebSocket 전송 검증

### 7.4 성능 테스트
- [ ] 부하 테스트
  - [ ] 100대 차량 동시 스트리밍
  - [ ] 1000개 WebSocket 연결
- [ ] 스트레스 테스트
  - [ ] Redis 업데이트 빈도 증가 (1000 updates/sec)

## 8. 배포 및 운영

### 8.1 환경 설정
- [ ] 환경 변수 관리
  - [ ] .env.development
  - [ ] .env.staging
  - [ ] .env.production
- [ ] Config Module 설정
  - [ ] 환경별 설정 분리
  - [ ] 검증 스키마

### 8.2 Docker 설정
- [ ] Dockerfile 작성
- [ ] docker-compose.yml 작성
  - [ ] NestJS 서비스
  - [ ] PostgreSQL
  - [ ] Redis
  - [ ] (선택) ROS2 Bridge

### 8.3 CI/CD
- [ ] GitHub Actions 설정
  - [ ] 린트 검사
  - [ ] 테스트 실행
  - [ ] 빌드 및 배포

### 8.4 문서화
- [ ] API 문서
  - [ ] GraphQL Playground 설정
  - [ ] Swagger (REST API)
- [ ] 아키텍처 문서
  - [ ] Clean Architecture 레이어 설명
  - [ ] 데이터 플로우 다이어그램
- [ ] 운영 가이드
  - [ ] Redis 키 스키마 문서
  - [ ] 트러블슈팅 가이드

## 9. 최적화 및 확장성

### 9.1 성능 최적화
- [ ] Database Query 최적화
  - [ ] 인덱스 추가
  - [ ] N+1 쿼리 해결
  - [ ] Connection Pooling
- [ ] Redis 최적화
  - [ ] Pipeline 사용
  - [ ] Key 만료 시간 설정
  - [ ] Memory 최적화
- [ ] WebSocket 최적화
  - [ ] 메시지 압축
  - [ ] Binary Protocol (MessagePack 등)

### 9.2 확장성 고려
- [ ] 수평 확장
  - [ ] Stateless 설계
  - [ ] Redis Cluster 지원
  - [ ] Load Balancer 설정
- [ ] 수직 확장
  - [ ] Worker Thread 활용
  - [ ] CPU/Memory 튜닝

### 9.3 장애 대응
- [ ] Circuit Breaker 패턴
  - [ ] Redis 연결 실패 시 대응
  - [ ] DB 연결 실패 시 대응
- [ ] Graceful Shutdown
  - [ ] 진행 중인 요청 완료 후 종료
  - [ ] WebSocket 연결 정리
- [ ] Retry 전략
  - [ ] Exponential Backoff
  - [ ] Dead Letter Queue

## 10. 추가 기능 (선택사항)

### 10.1 고급 기능
- [ ] 경로 예측 및 추적
  - [ ] 과거 위치 데이터 저장 (TimeSeries DB)
  - [ ] 경로 예측 알고리즘
- [ ] 충돌 감지
  - [ ] 차량 간 거리 계산
  - [ ] 충돌 위험 알림
- [ ] 플릿 관리
  - [ ] 차량 그룹화
  - [ ] 그룹별 통계

### 10.2 분석 및 리포팅
- [ ] 데이터 분석 API
  - [ ] 차량 이동 거리 통계
  - [ ] 배터리 사용 패턴
  - [ ] 에러 발생 빈도
- [ ] 리포트 생성
  - [ ] 일일 운영 리포트
  - [ ] 월간 통계 리포트

### 10.3 알림 시스템
- [ ] 이벤트 기반 알림
  - [ ] 배터리 부족 알림
  - [ ] 에러 발생 알림
  - [ ] 연결 끊김 알림
- [ ] 알림 채널
  - [ ] Email
  - [ ] Slack/Discord Webhook
  - [ ] Push Notification
