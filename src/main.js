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

  if (!navigator.serviceWorker.controller && !sessionStorage.getItem(MSW_RELOADED_FLAG)) {
    sessionStorage.setItem(MSW_RELOADED_FLAG, 'true')
    location.reload()
    return new Promise(() => {})
  }
}

initTheme()
registerAuthRefreshInterceptor()

const pinia = createPinia()
pinia.use(trackStore)

enableMocking().then(() => {
  createApp(App).use(pinia).use(router).mount('#app')
})
