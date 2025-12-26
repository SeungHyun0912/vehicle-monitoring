# Frontend - Vehicle Monitoring System

React 기반의 차량 모니터링 시스템 프론트엔드입니다.

## 기술 스택

- React 18
- TypeScript
- Vite
- React Router
- Axios

## 개발

```bash
# 개발 서버 실행
pnpm dev

# 빌드
pnpm build

# 프리뷰
pnpm preview

# 린트
pnpm lint

# 타입 체크
pnpm type-check
```

## 디렉토리 구조

```
src/
├── components/     # 재사용 가능한 컴포넌트
├── pages/          # 페이지 컴포넌트
├── hooks/          # 커스텀 훅
├── services/       # API 서비스
├── utils/          # 유틸리티 함수
└── types/          # TypeScript 타입 정의
```

## Path Alias

```typescript
@/*              -> src/*
@components/*    -> src/components/*
@pages/*         -> src/pages/*
@hooks/*         -> src/hooks/*
@services/*      -> src/services/*
@utils/*         -> src/utils/*
@types/*         -> src/types/*
```
