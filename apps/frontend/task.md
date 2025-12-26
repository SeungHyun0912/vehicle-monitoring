# Vehicle Monitoring Frontend - Task List

## 1. WebSocket 기반 차량 위치 정보 실시간 수신 및 관리

### 1.1 자율 주행 로봇 정보 클래스 설계
- [ ] 기본 Vehicle 인터페이스/클래스 정의
  - [ ] 공통 속성: id, name, type, position(x, y, z), rotation, speed, status
  - [ ] 상태 관리: IDLE, MOVING, CHARGING, ERROR, STOPPED
- [ ] AGV(Automated Guided Vehicle) 클래스 구현
  - [ ] 가이드 라인 기반 주행 특성 반영
  - [ ] 배터리 레벨, 적재 중량 속성
- [ ] AMR(Autonomous Mobile Robot) 클래스 구현
  - [ ] 자율 주행 특성 반영
  - [ ] 센서 데이터, 장애물 회피 상태
- [ ] OHT(Overhead Hoist Transport) 클래스 구현
  - [ ] 레일 기반 주행 특성
  - [ ] 호이스트 상태, 레일 위치
- [ ] Factory Pattern으로 차량 타입별 인스턴스 생성 로직 구현
- [ ] TypeScript 타입 정의 및 검증

### 1.2 GraphQL 백엔드 연동
- [ ] GraphQL Client 설정
  - [ ] Apollo Client 또는 urql 설치 및 설정
  - [ ] GraphQL endpoint 설정
  - [ ] 인증/인가 헤더 설정
- [ ] GraphQL Schema 정의
  - [ ] Vehicle Query 스키마 작성
  - [ ] Vehicle Mutation 스키마 작성
  - [ ] Subscription 스키마 작성 (실시간 업데이트)
- [ ] GraphQL Operations 구현
  - [ ] 차량 목록 조회 Query
  - [ ] 차량 상세 조회 Query
  - [ ] 차량 상태 업데이트 Mutation
  - [ ] 차량 위치 실시간 구독 Subscription
- [ ] Custom Hooks 작성
  - [ ] useVehicles(): 전체 차량 목록
  - [ ] useVehicle(id): 특정 차량 정보
  - [ ] useVehicleSubscription(): WebSocket 실시간 데이터

### 1.3 WebSocket 통신 구현
- [ ] WebSocket Client 설정
  - [ ] WebSocket 연결 관리 클래스 구현
  - [ ] 재연결 로직 구현 (exponential backoff)
  - [ ] 연결 상태 관리 (connecting, connected, disconnected, error)
- [ ] 메시지 프로토콜 정의
  - [ ] 메시지 타입 정의: POSITION_UPDATE, STATUS_CHANGE, ERROR
  - [ ] 메시지 직렬화/역직렬화
- [ ] 실시간 데이터 처리
  - [ ] 위치 업데이트 핸들러
  - [ ] 상태 변경 핸들러
  - [ ] 에러 핸들러
- [ ] 성능 최적화
  - [ ] 메시지 throttling/debouncing
  - [ ] 대용량 차량 데이터 처리 최적화

### 1.4 상태 관리
- [ ] 전역 상태 관리 라이브러리 선택 및 설정
  - [ ] Zustand / Recoil / Redux Toolkit 중 선택
- [ ] Vehicle Store 구현
  - [ ] 차량 목록 상태
  - [ ] 선택된 차량 상태
  - [ ] 필터/정렬 상태
- [ ] WebSocket 연결 상태 관리
- [ ] 에러 상태 관리

## 2. 자율 주행 로봇 경로 관리 및 시각화

### 2.1 경로 데이터 모델 설계
- [ ] Path 인터페이스 정의
  - [ ] waypoints: {x, y, z, timestamp}[]
  - [ ] pathType: PLANNED, ACTUAL, DEVIATION
  - [ ] vehicleId: string
  - [ ] createdAt, updatedAt
- [ ] PathSegment 클래스 구현
  - [ ] 구간별 속도, 예상 소요 시간
  - [ ] 구간 상태: PENDING, IN_PROGRESS, COMPLETED
- [ ] Route 클래스 구현
  - [ ] 출발지, 목적지, 경유지
  - [ ] 전체 경로 거리 계산
  - [ ] 진행률 계산
- [ ] Historical Path 데이터 구조
  - [ ] 과거 이동 경로 저장
  - [ ] 타임스탬프 기반 조회

### 2.2 Canvas API를 활용한 시각화 구현
- [ ] Canvas 컴포넌트 구조 설계
  - [ ] MapCanvas 컴포넌트 (메인 캔버스)
  - [ ] VehicleLayer (차량 레이어)
  - [ ] PathLayer (경로 레이어)
  - [ ] GridLayer (그리드/배경 레이어)
- [ ] 렌더링 엔진 구현
  - [ ] 기본 렌더링 루프 (requestAnimationFrame)
  - [ ] 레이어별 렌더링 순서 관리
  - [ ] 더블 버퍼링으로 깜빡임 방지
- [ ] 차량 시각화
  - [ ] 차량 아이콘 렌더링 (타입별 다른 모양/색상)
  - [ ] 차량 방향 표시 (화살표, 회전 각도)
  - [ ] 차량 레이블 (ID, 상태)
  - [ ] 선택 상태 하이라이트
- [ ] 경로 시각화
  - [ ] 계획된 경로 렌더링 (점선)
  - [ ] 실제 이동 경로 렌더링 (실선)
  - [ ] 경로 편차 시각화
  - [ ] Waypoint 마커 표시
- [ ] 인터랙션 기능
  - [ ] 줌 인/아웃 (마우스 휠, 핀치)
  - [ ] 패닝 (드래그)
  - [ ] 차량 클릭 선택
  - [ ] 툴팁 표시 (호버 시 상세 정보)
- [ ] 성능 최적화
  - [ ] 뷰포트 기반 컬링 (보이는 영역만 렌더링)
  - [ ] 차량이 많을 때 LOD(Level of Detail) 적용
  - [ ] WebGL 전환 검토 (차량 수가 많을 경우)

### 2.3 경로 관리 기능
- [ ] 경로 생성
  - [ ] 수동 경로 지정 (클릭으로 waypoint 추가)
  - [ ] A* 알고리즘 기반 자동 경로 생성
- [ ] 경로 수정
  - [ ] Waypoint 드래그로 위치 변경
  - [ ] Waypoint 추가/삭제
- [ ] 경로 분석
  - [ ] 총 거리 계산
  - [ ] 예상 소요 시간 계산
  - [ ] 경로 최적화 제안

## 3. UI/UX 컴포넌트

### 3.1 레이아웃
- [ ] 메인 레이아웃 컴포넌트
  - [ ] Header (제목, 연결 상태, 통계)
  - [ ] Sidebar (차량 목록, 필터)
  - [ ] Main Canvas (지도 시각화)
  - [ ] Footer (상태바)
- [ ] 반응형 디자인
  - [ ] 데스크톱, 태블릿, 모바일 대응

### 3.2 차량 관리 UI
- [ ] 차량 목록 패널
  - [ ] 차량 타입별 필터링
  - [ ] 상태별 필터링
  - [ ] 검색 기능
  - [ ] 정렬 기능 (이름, 상태, 배터리 등)
- [ ] 차량 상세 정보 패널
  - [ ] 실시간 위치, 속도, 방향
  - [ ] 배터리 레벨, 작업 상태
  - [ ] 이동 이력
  - [ ] 에러 로그

### 3.3 제어 패널
- [ ] 지도 컨트롤
  - [ ] 줌 버튼
  - [ ] 초기화 버튼 (view reset)
  - [ ] 레이어 토글 (경로, 그리드 등)
- [ ] 시간 컨트롤
  - [ ] 재생/일시정지 (이력 재생)
  - [ ] 배속 조절
  - [ ] 타임라인 슬라이더

### 3.4 알림 및 모니터링
- [ ] 실시간 알림 시스템
  - [ ] 차량 에러 알림
  - [ ] 경로 이탈 경고
  - [ ] 배터리 부족 경고
- [ ] 대시보드
  - [ ] 총 차량 수, 활성 차량 수
  - [ ] 평균 속도, 총 이동 거리
  - [ ] 상태별 차량 수 통계

## 4. 테스트 및 품질 관리

### 4.1 단위 테스트
- [ ] Vehicle 클래스 테스트
- [ ] Path 계산 로직 테스트
- [ ] WebSocket 연결 테스트
- [ ] GraphQL Query/Mutation 테스트

### 4.2 통합 테스트
- [ ] Canvas 렌더링 테스트
- [ ] 실시간 데이터 업데이트 플로우 테스트
- [ ] 사용자 인터랙션 테스트

### 4.3 E2E 테스트
- [ ] 차량 모니터링 시나리오 테스트
- [ ] 경로 생성 및 수정 시나리오 테스트

### 4.4 성능 테스트
- [ ] 100대 이상 차량 동시 렌더링 테스트
- [ ] 메모리 누수 체크
- [ ] 렌더링 FPS 측정

## 5. 배포 및 문서화

### 5.1 환경 설정
- [ ] 개발/스테이징/프로덕션 환경 분리
- [ ] 환경별 API 엔드포인트 설정
- [ ] 환경변수 관리

### 5.2 빌드 최적화
- [ ] 코드 스플리팅
- [ ] Tree shaking
- [ ] 번들 크기 최적화

### 5.3 문서화
- [ ] API 문서 작성
- [ ] 컴포넌트 스토리북
- [ ] 사용자 가이드

## 6. 추가 개선 사항 (선택)

### 6.1 고급 기능
- [ ] 다중 맵 지원 (층별, 구역별)
- [ ] 히트맵 시각화 (차량 밀집도)
- [ ] 충돌 예측 및 경고
- [ ] 차량 그룹 관리

### 6.2 데이터 분석
- [ ] 차량 효율성 분석
- [ ] 경로 최적화 리포트
- [ ] 사용 패턴 분석

### 6.3 접근성
- [ ] 키보드 네비게이션 지원
- [ ] 스크린 리더 지원
- [ ] 고대비 모드
