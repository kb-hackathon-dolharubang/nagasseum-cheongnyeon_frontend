# 나갔음청년 — Frontend

청년의 주거 독립을 자산, 소득, 정부 정책, 전문 상담까지 하나로 잇는 **데이터 기반 청년 자립 지원 플랫폼**의 프론트엔드입니다.
실제 금융 데이터로 진단한 독립 가능 시점, 받을 수 있는 정책, 선배·전문가 상담 결과를 하나의 화면 흐름으로 보여줍니다.

---

## 핵심 흐름

```
① 진단 (자산 연동, 주거 목표 진단, 또래 비교) -> ② 정책 판정 (정책 사전 자격 판정) -> ③ 상담 연결 (전문가, 멘토 예약, 상담 요약 확인)
```

---

## 기능 구성

| 기능                 | 설명                                                        | 담당 도메인 |
| -------------------- | ----------------------------------------------------------- | ----------- |
| **소셜 로그인**      | Kakao OAuth2 로그인 및 인증 상태 관리                       | `auth`      |
| **자산 연동**        | CODEF 마이데이터 연동 결과 조회, 순자산 현황 시각화         | `asset`     |
| **주거 목표 진단**   | 목표 보증금 설정, 달성 가능성·시뮬레이션 결과 확인          | `goal`      |
| **주거 추천**        | 목표 미달성 시 대안 카드(Realistic/Preference/HoldOut) 제시 | `goal`      |
| **또래 비교**        | 동일 연령·소득 구간 사용자와 자산·목표 익명 비교            | `compare`   |
| **정책 조회**        | 청년 정책 목록 및 사전 자격 판정 결과 확인                  | `policy`    |
| **AI 상담**          | LLM 기반 정책 Q&A, 상담 요약 확인                           | `consult`   |
| **전문가·멘토 연결** | 선배 청년 멘토 및 금융 전문가 상담 예약                     | `counselor` |
| **회원 관리**        | 내 정보 조회 및 수정                                        | `member`    |
| **홈 대시보드**      | 진단·정책·상담 요약을 한 화면에 표시                        | `home`      |

---

## 기술 스택

| 구분        | 기술                                      |
| ----------- | ----------------------------------------- |
| Framework   | Vue 3 (Composition API, `<script setup>`) |
| Build       | Vite                                      |
| Router      | Vue Router                                |
| State       | Pinia                                     |
| HTTP Client | Axios                                     |
| Mock        | MSW (Mock Service Worker)                 |
| Lint/Format | ESLint + Prettier + Husky + lint-staged   |
| Language    | JavaScript (ES Modules)                   |

---

## 프로젝트 구조

feature-based 아키텍처를 따릅니다. 자세한 규칙은 [docs/architecture.md](docs/architecture.md) 참고.

```
src/
├── features/
│   └── {domain}/
│       ├── api/          API 함수
│       ├── components/   도메인 전용 컴포넌트
│       ├── composables/  도메인 전용 composable
│       ├── store/        Pinia store
│       ├── views/        라우트에 연결되는 화면
│       └── index.js      외부에 노출하는 공개 API
│
├── shared/
│   ├── api/         공용 Axios 인스턴스 (httpClient.js)
│   ├── components/  공용 UI 컴포넌트
│   ├── composables/ 공용 composable
│   ├── constants/   공용 상수
│   └── utils/        공용 유틸
│
├── layouts/   레이아웃 컴포넌트
├── router/    도메인별 라우트 정의 및 통합
├── assets/    전역 스타일, 이미지
├── mocks/     MSW 핸들러
│
├── App.vue
└── main.js
```

### 도메인 구성 (`src/features`)

```
auth        Kakao OAuth2 로그인, 인증 상태
asset       자산 연동 (CODEF), 순자산 조회
goal        목표 설정, 시뮬레이션·추천 결과 조회
compare     또래 비교
policy      청년 정책 목록, 사전 자격 판정 결과
consult     AI 상담, 상담 요약
counselor   전문가·멘토 상담 예약
member      회원 정보 관리
home        홈 대시보드
```

### 의존 규칙

```
features/* → shared/*
router     → features/*
layouts    → shared/*
```

- 다른 feature를 직접 import하지 않습니다. (공유 로직은 `shared/`로 이동)
- `shared/`는 `features/`를 import하지 않습니다.
- 다른 feature의 내부 파일이 아닌 `index.js` 공개 API만 import합니다.

---

## Git 컨벤션

### 커밋 메시지

`type(scope): subject` 형식을 따릅니다.

| 타입       | 설명                               |
| ---------- | ---------------------------------- |
| `feat`     | 새로운 기능                        |
| `fix`      | 버그 수정                          |
| `design`   | UI/UX, CSS, 스타일링 변경          |
| `style`    | 포맷팅 등 코드 로직 변경 없는 수정 |
| `refactor` | 기능 변경 없는 코드 개선           |
| `docs`     | 문서 변경                          |
| `test`     | 테스트 추가/수정                   |
| `chore`    | 빌드, 설정 등 기타 변경            |

### 브랜치

kebab-case를 사용하며, 필요 시 이슈 번호를 포함합니다.

| 브랜치      | 용도                                |
| ----------- | ----------------------------------- |
| `main`      | 프로덕션                            |
| `develop`   | 기본 개발 브랜치                    |
| `feature/*` | 신규 기능 (예: `feature/loan-list`) |
| `fix/*`     | 버그 수정                           |
| `hotfix/*`  | 프로덕션 긴급 수정                  |

자세한 워크플로우는 [docs/workflow.md](docs/workflow.md) 참고.

---

## 로컬 실행

### ⚠️ 필수 환경

| 항목    | 버전                | 주의                         |
| ------- | ------------------- | ---------------------------- |
| Node.js | **20.19+ / 22.12+** | Vite 8 · ESLint 10 요구 버전 |
| npm     | 10+                 | Node.js에 기본 포함          |

### 환경 변수

`.env` 파일을 생성합니다.

```
VITE_API_BASE_URL=
VITE_USE_MOCK=
VITE_SKIP_AUTH_GUARD=
VITE_KAKAO_CLIENT_ID=
VITE_KAKAO_REDIRECT_URI=
VITE_DEV_MEMBER_ID=
```

백엔드 API가 준비되지 않은 기능은 MSW로 목업 응답을 제공합니다. `VITE_USE_MOCK=true` 설정 및 사용법은 [docs/msw.md](docs/msw.md) 참고.

### 실행 순서

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 실행
npm run dev

# 3. 빌드
npm run build

# 4. 빌드 결과 미리보기
npm run preview
```

### Lint

```bash
npm run lint
```

---

## 참고 문서

| 문서                                                   | 내용                                |
| ------------------------------------------------------ | ----------------------------------- |
| [docs/workflow.md](docs/workflow.md)                   | 브랜치, 커밋, PR, 머지 워크플로우   |
| [docs/architecture.md](docs/architecture.md)           | 도메인 추가 기준, 파일 위치 규칙    |
| [docs/coding-convention.md](docs/coding-convention.md) | 파일·컴포넌트 네이밍 규칙           |
| [docs/msw.md](docs/msw.md)                             | 백엔드 미완성 기능의 목업 처리 방법 |
