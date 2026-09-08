import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/styles/main.css'
import App from './App.vue'
import router from './router'

import { registerAuthRefreshInterceptor } from '@/features/auth'
import { trackStore } from '@/shared/utils/storeRegistry'
import { initTheme } from '@/shared/composables/useTheme'

const MSW_RELOADED_FLAG = 'msw-reloaded'

async function enableMocking() {
  if (import.meta.env.VITE_USE_MOCK !== 'true') return

  const { worker } = await import('@/mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })

  /*
    Service Worker를 이 탭에서 처음 등록하는 로드에서는 worker.start()가 resolve돼도
    아직 이 탭이 컨트롤러가 아니라서 MSW가 요청을 가로채지 못한다(MSW 자체 제약).
    이 상태로 API를 호출하면 실제 백엔드로 요청이 나가 ERR_CONNECTION_REFUSED가 뜨고,
    새로고침해야 정상 동작한다. 세션당 한 번만 자동으로 새로고침해 우회한다.
  */
  if (!navigator.serviceWorker.controller && !sessionStorage.getItem(MSW_RELOADED_FLAG)) {
    sessionStorage.setItem(MSW_RELOADED_FLAG, 'true')
    location.reload()
    return new Promise(() => {})
  }
}

// 첫 페인트 전에 data-theme을 세팅해야 테마 깜빡임(FOUC)이 없다.
initTheme()
registerAuthRefreshInterceptor()

const pinia = createPinia()
pinia.use(trackStore)

enableMocking().then(() => {
  createApp(App).use(pinia).use(router).mount('#app')
})
