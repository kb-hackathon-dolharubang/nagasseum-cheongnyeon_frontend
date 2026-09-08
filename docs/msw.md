# MSW (Mock Service Worker)

코딩 에이전트가 백엔드 API 없이(또는 에러·빈 값 등 특정 응답을 재현하며) 프론트엔드 기능을 구현·검증할 때 사용하는 [MSW(Mock Service Worker)](https://mswjs.io/) 설정 방법이다. 실제 네트워크 요청을 가로채 정의된 목 응답으로 대체하는 방식이라, 컴포넌트/스토어/API 함수 코드는 실제 백엔드를 붙일 때와 동일하게 유지된다. 새 도메인 기능을 구현할 때 백엔드 API가 아직 없다면, 임의로 fetch를 스텁하지 말고 아래 절차대로 MSW 핸들러를 추가한다.

---

## 구조

```
src/mocks/
├── browser.js              # msw/browser의 setupWorker에 handlers를 등록하는 진입점
├── handlers/
│   ├── index.js            # 도메인별 핸들러를 모아 하나의 handlers 배열로 export
│   └── {domain}Handlers.js # 도메인별 목 API 핸들러 (authHandlers.js 등)
└── data/                   # 핸들러가 반환할 목 데이터(fixture)

public/
└── mockServiceWorker.js    # `npx msw init public/` 로 생성된 서비스 워커 스크립트 (직접 수정 금지)
```

전체 패키지 구조 안에서 `mocks/`가 어디에 위치하는지는 [architecture.md](./architecture.md)를 참고하세요.

---

## 활성화 방법

`.env`의 `VITE_USE_MOCK` 값으로 on/off 합니다.

```
VITE_USE_MOCK=true   # MSW 활성화 (목 데이터로 응답)
VITE_USE_MOCK=false  # MSW 비활성화 (실제 백엔드 localhost:8080 호출)
```

`src/main.js`에서 앱을 마운트하기 전에 `VITE_USE_MOCK`을 확인해 워커를 시작합니다.

```js
async function enableMocking() {
  if (import.meta.env.VITE_USE_MOCK !== 'true') return

  const { worker } = await import('@/mocks/browser')
  return worker.start({ onUnhandledRequest: 'bypass' })
}

enableMocking().then(() => {
  createApp(App).use(createPinia()).use(router).mount('#app')
})
```

- `onUnhandledRequest: 'bypass'`: 핸들러가 등록되지 않은 요청은 경고 없이 실제 네트워크로 그대로 보냅니다. 일부 API만 목으로 대체하고 나머지는 실제 백엔드를 그대로 쓰고 싶을 때 유용합니다.
- 값이 `true`가 아니면 `worker.start()` 자체를 호출하지 않으므로, 프로덕션 빌드나 `VITE_USE_MOCK=false` 환경에서는 MSW 관련 코드가 아예 실행되지 않습니다.

---

## 새 도메인 핸들러 추가하기

`src/features/auth`(카카오 로그인)에 실제로 적용된 흐름을 예시로 설명합니다.

1. `src/features/{domain}/api/{domain}Api.js`에서 `httpClient`로 실제 API를 호출하는 함수를 정의합니다. MSW는 이 요청을 가로챕니다.

```js
// src/features/auth/api/authApi.js
import httpClient from '@/shared/api/httpClient'

export async function loginWithKakao() {
  const { data } = await httpClient.post('/api/v1/auth/kakao')
  return data
}
```

2. `src/mocks/data/{domain}.js`에 목 데이터를 정의합니다.

```js
// src/mocks/data/auth.js
export const mockLoginResponse = {
  accessToken: 'mock-access-token',
  user: {
    id: 1,
    nickname: '내집마련청년',
    profileImage: 'https://placehold.co/80x80',
  },
}
```

3. `src/mocks/handlers/{domain}Handlers.js`에 요청 URL과 응답을 정의합니다. `httpClient`가 실제로 요청을 보내는 주소는 `VITE_API_BASE_URL`(`http://localhost:8080`) + 경로(`/api/v1/auth/kakao`)이므로, 핸들러도 **반드시 `VITE_API_BASE_URL`을 붙인 절대 경로**로 등록해야 합니다. (이유는 아래 "주의사항"의 origin 관련 항목 참고)

```js
// src/mocks/handlers/authHandlers.js
import { http, HttpResponse } from 'msw'

import { mockLoginResponse } from '@/mocks/data/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const authHandlers = [
  http.post(`${API_BASE_URL}/api/v1/auth/kakao`, () => {
    return HttpResponse.json(mockLoginResponse)
  }),
]
```

4. `src/mocks/handlers/index.js`에 새 핸들러를 추가합니다.

```js
import { authHandlers } from '@/mocks/handlers/authHandlers'

export const handlers = [...authHandlers]
```

이렇게 등록하면 `src/features/auth/store/authStore.js`의 `loginWithKakaoAccount()` → `authApi.js`의 `loginWithKakao()` → `httpClient.post(...)` 순서로 호출되고, MSW가 이를 가로채 `mockLoginResponse`를 돌려줍니다. 실제 동작은 `/login` 라우트([LoginView.vue](../src/features/auth/views/LoginView.vue))에서 확인할 수 있습니다.

---

## 동작 확인

기능 구현을 완료로 표시하기 전에 반드시 아래를 직접 확인한다(빌드/lint 통과만으로는 기능 동작을 보장하지 않는다).

1. `.env`에서 `VITE_USE_MOCK=true`로 설정한다.
2. `npm run dev` 실행 후 브라우저 콘솔에 `[MSW] Mocking enabled.` 로그가 찍히는지 확인한다.
3. 개발자 도구 Network 탭에서 목 API 요청에 `(from service worker)` 표시가 붙는지 확인한다.

---

## 주의사항

- **핸들러 URL은 상대 경로로 등록하면 안 됩니다.** MSW는 상대 경로(`/api/loans`)를 페이지 origin(`http://localhost:5173`) 기준으로 해석합니다. 하지만 `httpClient`는 `VITE_API_BASE_URL`(`http://localhost:8080`)을 `baseURL`로 사용하므로 실제 요청은 다른 origin으로 나갑니다. 이 origin 불일치 때문에 핸들러가 매칭되지 않고, 요청이 그대로 실제 백엔드로 흘러가 `Failed to fetch` / `Network Error`가 발생합니다. 반드시 위 예시처럼 `` `${API_BASE_URL}/api/...` `` 형태의 절대 경로로 등록하세요.
- `.env`는 저장소에 커밋되므로, 로컬 테스트를 위해 `VITE_USE_MOCK=true`를 사용하고, 실제 API 사용 시에는 `VITE_USE_MOCK=false`로 설정하세요.
- `public/mockServiceWorker.js`는 `npx msw init public/ --save`로 생성된 파일입니다. MSW 버전을 올릴 경우 동일 명령으로 재생성하세요.
- 목 핸들러는 실제 API 응답 스펙과 최대한 동일하게 유지해, 나중에 `VITE_USE_MOCK=false`로 전환했을 때 화면이 깨지지 않도록 합니다.
