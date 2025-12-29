# Vehicle Monitoring Backend

자율 주행 로봇 모니터링 시스템 백엔드 서버

## 기술 스택

- **Framework**: NestJS
- **Database**: PostgreSQL
- **Cache/PubSub**: Redis
- **API**: GraphQL (Apollo Server)
- **Real-time**: WebSocket (Socket.IO)
- **ORM**: TypeORM
- **Architecture**: Clean Architecture (Domain-Driven Design)

## 프로젝트 구조

```
src/
├── domain/                     # Domain Layer (비즈니스 로직)
│   ├── entities/              # Domain Entities
│   ├── value-objects/         # Value Objects
│   └── repositories/          # Repository Interfaces
│
├── application/               # Application Layer (Use Cases)
│   └── use-cases/
│
├── infrastructure/            # Infrastructure Layer (기술 구현)
│   ├── config/               # 설정 파일
│   ├── database/             # TypeORM Entities & Repositories
│   │   ├── entities/
│   │   ├── mappers/
│   │   ├── migrations/
│   │   └── repositories/
│   ├── redis/                # Redis Repositories & Services
│   │   ├── repositories/
│   │   └── services/
│   └── health/               # Health Check
│
└── presentation/             # Presentation Layer (API)
    ├── graphql/              # GraphQL Resolvers & Types
    └── websocket/            # WebSocket Gateways
```

## 시작하기

### 1. 필수 요구사항

- Node.js 18+
- PostgreSQL 13+
- Redis 6+

### 2. 환경 설정

.env 파일을 생성하고 다음 설정을 추가하세요:

```bash
# Server
PORT=4000
NODE_ENV=development

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=vehicle_monitoring
DB_SYNC=true
DB_LOGGING=true

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### 3. 설치

```bash
npm install
```

### 4. 데이터베이스 설정

#### PostgreSQL 데이터베이스 생성

```bash
# PostgreSQL에 접속
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE vehicle_monitoring;

# 종료
\q
```

#### Migration 실행

```bash
# Migration 실행 (테이블 생성)
npm run migration:run
```

### 5. Redis 서버 시작

```bash
redis-server
```

### 6. 서버 실행

```bash
npm run dev
```

### 7. 접속 확인

- **Health Check**: http://localhost:4000/health
- **GraphQL Playground**: http://localhost:4000/graphql
- **WebSocket**: ws://localhost:4000/vehicles

## 테스트 도구

### Redis Vehicle Simulator

```bash
npm run simulator
```

자세한 내용은 [tools/README.md](tools/README.md)를 참조하세요.

## NPM Scripts

```bash
npm run dev                 # 개발 서버 실행
npm run build              # 프로덕션 빌드
npm run simulator          # 차량 시뮬레이터
npm run migration:run      # Migration 실행
npm run migration:show     # Migration 상태 확인
```

## API 문서

- **GraphQL Playground**: http://localhost:4000/graphql
- **Health Check**: http://localhost:4000/health

자세한 사용법은 [docs/TASK3_IMPLEMENTATION_SUMMARY.md](docs/TASK3_IMPLEMENTATION_SUMMARY.md)를 참조하세요.
