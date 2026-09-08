import { createRouter, createWebHistory } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import MobileLayout from '@/layouts/MobileLayout.vue'

import NotFoundView from '@/shared/components/NotFoundView.vue'

import { authRoutes } from '@/router/routes/auth.routes'
import { assetRoutes, assetDetailRoutes, assetManagementRoutes } from '@/router/routes/asset.routes'
import { useAuthStore } from '@/features/auth'
import { compareRoutes } from '@/router/routes/compare.routes'
import { homeRoutes } from '@/router/routes/home.routes'
import { goalRoutes } from '@/router/routes/goal.routes'
import { memberRoutes } from '@/router/routes/member.routes'
import { consultRoutes } from '@/router/routes/consult.routes'
import { counselorRoutes } from '@/router/routes/counselor.routes'

const AUTH_REQUIRED_ROUTE_NAMES = [
  'deposit-info',
  'asset-link',
  'asset-auth',
  'asset-syncing',
  'asset-link-additional',
  'asset-detail',
  'home',
  'compare',
  'my',
  'edit-info',
  'consult',
]

// 로컬 개발 전용. 각 화면을 로그인 없이 바로 확인하기 위한 우회이며, 프로덕션 빌드에서는 반드시 꺼져 있어야 한다.
const SKIP_AUTH_GUARD = import.meta.env.VITE_SKIP_AUTH_GUARD === 'true'

const routes = [
  {
    path: '/',
    component: AuthLayout,
    children: [...authRoutes, ...assetRoutes],
  },
  {
    path: '/',
    component: MobileLayout,
    children: [
      ...homeRoutes,
      ...goalRoutes,
      ...compareRoutes,
      ...memberRoutes,
      ...assetDetailRoutes,
      ...assetManagementRoutes,
      ...consultRoutes,
      ...counselorRoutes,
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  if (SKIP_AUTH_GUARD) return true

  const authStore = useAuthStore()

  if (to.name === 'login' && authStore.user) return { name: 'home' }
  if (!AUTH_REQUIRED_ROUTE_NAMES.includes(to.name)) return true
  if (!authStore.user) return { name: 'login' }

  return true
})

export default router
