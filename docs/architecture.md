# Architecture

Claude Code 등 코딩 에이전트가 이 저장소에서 코드를 생성·수정할 때 반드시 따라야 하는 패키지 구조와 의존성 규칙을 정의한다. 도메인 단위로 관련 파일(api, store, components, views)을 묶는 feature-based 구조를 사용한다.

---

## 패키지 구조

```
src/
│
├── features/                        # 도메인별 독립 모듈
│   └── {domain}/
│       ├── api/
│       │   └── {domain}Api.js       # 해당 도메인 API 호출 함수 모음
│       │
│       ├── components/              # 해당 도메인 전용 UI 컴포넌트
│       │   ├── {Domain}Table.vue
│       │   ├── {Domain}Form.vue
│       │   └── {Domain}Card.vue
│       │
│       ├── composables/             # 해당 도메인 전용 훅
│       │   └── use{Domain}.js
│       │
│       ├── store/
│       │   └── {domain}Store.js     # Pinia 스토어 (해당 도메인 상태만 관리)
│       │
│       ├── views/                   # 라우팅 대상 페이지 컴포넌트
│       │   ├── {Domain}ListView.vue
│       │   ├── {Domain}DetailView.vue
│       │   └── {Domain}CreateView.vue
│       │
│       └── index.js                 # 외부 공개 인터페이스 (barrel export)
│
├── shared/                          # 도메인 간 공통 리소스
│   ├── api/
│   │   ├── httpClient.js            # axios 인스턴스 & 인터셉터 설정
│   │   └── errorHandler.js
│   │
│   ├── components/                  # 공용 UI 컴포넌트
│   │   ├── BaseButton.vue           # 공용 컴포넌트는 "Base"로 시작합니다.
│   │   ├── BaseTable.vue
│   │   ├── BaseModal.vue
│   │   ├── BasePagination.vue
│   │   └── BaseInput.vue
│   │
│   ├── composables/                 # 공용 훅
│   │   ├── useModal.js
│   │   ├── usePagination.js
│   │   └── useToast.js
│   │
│   ├── constants/                   # 전역 상수
│   │   └── statusCode.js
│   │
│   └── utils/                       # 순수 유틸 함수
│       ├── formatter.js             # 날짜, 금액 포맷
│       └── validator.js
│
├── layouts/                         # 전체 레이아웃
│   ├── DefaultLayout.vue            # Sidebar + Header 포함 기본 레이아웃
│   └── AuthLayout.vue               # 로그인 등 인증 페이지 레이아웃
│
├── router/
│   ├── index.js                     # Vue Router 진입점
│   └── routes/                      # 도메인별 라우트 분리
│       └── {domain}.routes.js
│
├── mocks/                           # MSW(Mock Service Worker) 설정 — 자세한 내용은 [msw.md](./msw.md) 참고
│   ├── browser.js                   # setupWorker 진입점
│   ├── handlers/
│   │   ├── index.js                 # 전체 핸들러 취합
│   │   └── {domain}Handlers.js      # 도메인별 목 API 핸들러
│   └── data/                        # 핸들러가 참조하는 목 데이터(fixture)
│
├── assets/                          # 정적 리소스
│   ├── images/
│   └── styles/
│       └── main.css
│
├── App.vue
└── main.js
```

**새 도메인을 추가할 때는 `features/{domain}` 하위에 위 구조(`api/components/composables/store/views/index.js`)를 그대로 생성한다. 구조를 임의로 생략하거나 변형하지 않는다.**

---

## Dependency Rules

도메인 간 무분별한 직접 참조를 방지하기 위해 아래 규칙을 따릅니다.

```
features/{domain-A}  →  features/{domain-B}  직접 import 금지
features/{domain}    →  shared/              허용
shared/              →  features/{domain}    금지
```

- 각 도메인의 `index.js`를 통해서만 외부로 공개 (내부 구현 은닉)
- 도메인 간 공유 로직은 반드시 `shared/`로 추출 후 사용
- 코드를 생성·수정할 때 위 규칙을 위반하는 import(feature 간 직접 참조, `shared → features`)를 추가하지 않는다
