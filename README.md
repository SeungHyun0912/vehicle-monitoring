# Vehicle Monitoring System

실시간 자율 주행 로봇 모니터링 시스템을 위한 모노레포 프로젝트입니다.

## 프로젝트 구조

```
vehicle-monitoring/
├── apps/
│   ├── frontend/          # React 프론트엔드 (Vite)
│   └── backend/           # NestJS 백엔드 (Clean Architecture)
├── packages/              # 공유 패키지
└── pnpm-workspace.yaml    # pnpm workspace 설정
```

## 기술 스택

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- Axios

### Backend
- NestJS
- GraphQL (Apollo Server)
- TypeScript
- Clean Architecture
- Redis + Pub/Sub
- WebSocket (Socket.IO)
- PostgreSQL + TypeORM (예정)

## 아키텍처

### Frontend 구조
```
apps/frontend/src/
├── components/     # 재사용 가능한 컴포넌트
├── pages/          # 페이지 컴포넌트
├── hooks/          # 커스텀 훅
├── services/       # API 서비스
├── utils/          # 유틸리티 함수
└── types/          # TypeScript 타입 정의
```

### Backend 구조 (Clean Architecture)
```
apps/backend/src/
├── domain/              # 도메인 레이어
│   ├── entities/        # 엔티티
│   ├── repositories/    # 리포지토리 인터페이스
│   └── value-objects/   # 값 객체
├── application/         # 애플리케이션 레이어
│   ├── use-cases/       # 유즈케이스
│   ├── dtos/            # 데이터 전송 객체
│   └── interfaces/      # 인터페이스
├── infrastructure/      # 인프라스트럭처 레이어
│   ├── database/        # 데이터베이스 설정
│   ├── repositories/    # 리포지토리 구현
│   └── config/          # 설정
└── presentation/        # 프레젠테이션 레이어
    ├── controllers/     # 컨트롤러
    ├── middlewares/     # 미들웨어
    └── filters/         # 필터
```

## 시작하기

### 필수 요구사항

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 설치

```bash
# 의존성 설치
pnpm install
```

### 개발 서버 실행

```bash
# 전체 프로젝트 개발 서버 실행
pnpm dev

# 프론트엔드만 실행
pnpm dev:frontend

# 백엔드만 실행
pnpm dev:backend
```

### 빌드

```bash
# 전체 프로젝트 빌드
pnpm build

# 프론트엔드만 빌드
pnpm build:frontend

# 백엔드만 빌드
pnpm build:backend
```

### 테스트

```bash
# 전체 프로젝트 테스트
pnpm test
```

## 개발 가이드

### 환경 변수 설정

#### Backend
`apps/backend/.env.example`을 `.env`로 복사하고 필요한 값을 설정하세요.

### API 문서

백엔드 서버 실행 후 다음 엔드포인트를 사용할 수 있습니다:
- GraphQL Playground: http://localhost:4000/graphql
- WebSocket: ws://localhost:4000/vehicles
- Health Check: http://localhost:4000/health
- Redis Health: http://localhost:4000/health/redis

### Backend 구현 문서

- [Task 1: Entity 설계 및 GraphQL 구현](apps/backend/IMPLEMENTATION_SUMMARY.md)
- [Task 2: Redis 연동 및 실시간 데이터 처리](apps/backend/TASK2_IMPLEMENTATION_SUMMARY.md)
- [Task List](apps/backend/task.md)

## 포트 설정

- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- Redis: localhost:6379 (default)

## 개발 진행 상황

- ✅ **Task 1**: 자율 주행 로봇 Entity 설계 및 GraphQL 구현
  - Domain Layer (Entities, Value Objects, Repository Interfaces)
  - GraphQL Schema (Types, Queries, Mutations, Subscriptions)

- ✅ **Task 2**: Redis 연동 및 실시간 데이터 처리
  - Redis Infrastructure (Client, Pub/Sub)
  - Redis Repositories (Position, State)
  - WebSocket Gateway (Socket.IO)
  - Redis → WebSocket Bridge

- ⏳ **Task 3**: Database 연동 및 Use Cases 구현 (예정)
- ⏳ **Task 4**: Frontend 구현 (예정)

## 라이선스

MIT
