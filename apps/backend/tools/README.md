# Vehicle Monitoring Tools

이 디렉토리는 개발 및 테스트를 위한 유틸리티 도구들을 포함합니다.

## ROS2 Vehicle Simulator

Redis Pub/Sub 및 WebSocket을 테스트하기 위한 차량 시뮬레이터입니다.

### 기능

- ✅ Redis 연결 및 Pub/Sub 통신
- ✅ 여러 타입의 차량 시뮬레이션 (AMR, AGV, OHT)
- ✅ 실시간 위치 업데이트 (100ms 간격)
- ✅ 배터리 소모 및 충전 시뮬레이션
- ✅ 온도 변화 시뮬레이션
- ✅ 정해진 루트를 따라 이동
- ✅ ROS2 메시지 포맷과 유사한 데이터 구조

### 차량 타입별 루트

#### AMR (Autonomous Mobile Robot)
- 창고 바닥 순찰 루트 (사각형)
- 속도: 1.5 m/s
- 자유로운 경로 이동

#### AGV (Automated Guided Vehicle)
- 라인 팔로잉 루트 (직선 왕복)
- 속도: 1.0 m/s
- 정해진 경로 이동

#### OHT (Overhead Hoist Transport)
- 오버헤드 레일 루트 (공중 3m 높이)
- 속도: 2.0 m/s
- 레일을 따라 이동

### 설치

```bash
cd apps/backend
npm install
```

### 실행

#### 기본 실행 (4대 차량)

```bash
npm run simulator
```

또는

```bash
npx ts-node tools/redis-vehicle-simulator.ts
```

#### 환경변수 설정

```bash
# .env 파일 또는 직접 설정
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

npm run simulator
```

### 출력 예시

```
✅ Connected to Redis
🤖 Created AMR vehicle: amr-001
🤖 Created AMR vehicle: amr-002
🤖 Created AGV vehicle: agv-001
🤖 Created OHT vehicle: oht-001

✨ Vehicles created. Starting simulation...

🚀 Starting ROS2 Vehicle Simulator...

📍 amr-001 reached waypoint 1
📍 agv-001 reached waypoint 1

📊 Vehicle Status Report:
  amr-001 (AMR): Pos(5.23, 0.00, 0.00) Battery: 95.2% Temp: 35.4°C
  amr-002 (AMR): Pos(2.15, 0.00, 0.00) Battery: 98.7% Temp: 33.1°C
  agv-001 (AGV): Pos(10.50, 0.00, 0.00) Battery: 96.4% Temp: 34.8°C
  oht-001 (OHT): Pos(7.80, 0.00, 3.00) Battery: 93.1% Temp: 36.2°C

🔋 amr-002 recharged to 100%
```

### 종료

`Ctrl+C` 또는 `SIGTERM`을 보내면 정상적으로 종료됩니다.

```
^C
🔴 Received SIGINT signal
🛑 Stopping simulator...
✅ Simulator stopped
```

### Redis 데이터 구조

시뮬레이터는 다음과 같은 Redis 키에 데이터를 저장합니다:

```
vehicle:amr-001:position = {
  "x": 5.23,
  "y": 0.00,
  "z": 0.00,
  "qx": 0,
  "qy": 0,
  "qz": 0,
  "qw": 1,
  "heading": 0,
  "timestamp": 1234567890,
  "frame_id": "map",
  "mapId": "warehouse-floor-1"
}

vehicle:amr-001:state = {
  "currentSpeed": 1.5,
  "batteryLevel": 95.2,
  "currentLoad": 0,
  "temperature": 35.4,
  "errorCodes": [],
  "timestamp": 1234567890
}

vehicles:active = ["amr-001", "amr-002", "agv-001", "oht-001"]
```

### Pub/Sub 채널

시뮬레이터는 다음 채널에 업데이트를 발행합니다:

- `vehicle:position:update` - 위치 업데이트
- `vehicle:state:update` - 상태 업데이트

### 백엔드 서버와 함께 사용

1. **Redis 서버 시작**
   ```bash
   redis-server
   ```

2. **시뮬레이터 시작** (터미널 1)
   ```bash
   cd apps/backend
   npm run simulator
   ```

3. **백엔드 서버 시작** (터미널 2)
   ```bash
   cd apps/backend
   npm run dev
   ```

4. **WebSocket 클라이언트 연결**
   ```javascript
   const socket = io('http://localhost:4000/vehicles');

   socket.emit('subscribeAll');

   socket.on('positionUpdate', (data) => {
     console.log('Position update:', data);
   });

   socket.on('stateChange', (data) => {
     console.log('State change:', data);
   });
   ```

5. **GraphQL Playground에서 조회**
   - http://localhost:4000/graphql
   ```graphql
   query {
     vehiclePosition(vehicleId: "amr-001") {
       x
       y
       z
       heading
       timestamp
     }
   }
   ```

### 커스터마이징

시뮬레이터 코드를 수정하여:
- 차량 수 변경
- 루트 경로 변경
- 업데이트 주기 변경
- 차량 속도 변경
- 배터리 소모율 변경

등을 설정할 수 있습니다.

### 주의사항

- Redis 서버가 실행 중이어야 합니다
- 시뮬레이터는 테스트 목적으로만 사용하세요
- 프로덕션 환경에서는 사용하지 마세요
