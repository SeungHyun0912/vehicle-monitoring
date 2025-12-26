# Backend - Vehicle Monitoring System

NestJS 기반의 차량 모니터링 시스템 백엔드입니다.

## 기술 스택

- NestJS
- TypeScript
- Clean Architecture

## 개발

```bash
# 개발 서버 실행
pnpm dev

# 빌드
pnpm build

# 프로덕션 실행
pnpm start:prod

# 린트
pnpm lint

# 테스트
pnpm test

# 테스트 커버리지
pnpm test:cov
```

## Clean Architecture

### 레이어 구조

1. **Domain Layer** (도메인 레이어)
   - 비즈니스 로직의 핵심
   - 외부 의존성 없음
   - Entities, Value Objects, Repository Interfaces

2. **Application Layer** (애플리케이션 레이어)
   - 유즈케이스 구현
   - 도메인 레이어에만 의존
   - Use Cases, DTOs, Interfaces

3. **Infrastructure Layer** (인프라스트럭처 레이어)
   - 외부 시스템과의 연동
   - Repository 구현, Database, External APIs

4. **Presentation Layer** (프레젠테이션 레이어)
   - HTTP 요청/응답 처리
   - Controllers, Middlewares, Filters

### Path Alias

```typescript
@domain/*          -> src/domain/*
@application/*     -> src/application/*
@infrastructure/*  -> src/infrastructure/*
@presentation/*    -> src/presentation/*
```

## API 문서

Swagger 문서: http://localhost:4000/api/docs

## 환경 변수

`.env.example`을 참고하여 `.env` 파일을 생성하세요.
