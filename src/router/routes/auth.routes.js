import {
  LoginView,
  CallbackLoginView,
  CallbackSignupView,
  BasicInfoView,
  DepositInfoView,
  useAuthStore,
} from '@/features/auth'

export const authRoutes = [
  {
    path: '',
    redirect: { name: 'login' },
  },
  {
    path: 'login',
    name: 'login',
    component: LoginView,
  },
  {
    path: 'logout',
    name: 'logout',
    // 다른 feature가 authStore를 직접 import하지 않도록, 로그아웃은 라우트 진입 시점에
    // 여기서만 처리하고 로그인 화면으로 리다이렉트한다. 실제로 렌더되는 화면은 없다.
    beforeEnter: async () => {
      const authStore = useAuthStore()
      await authStore.logout()
      return { name: 'login' }
    },
  },
  {
    path: 'callback',
    name: 'callback-login',
    component: CallbackLoginView,
  },
  {
    path: 'callback/signup',
    name: 'callback-signup',
    component: CallbackSignupView,
  },
  {
    path: 'basic-info',
    name: 'basic-info',
    component: BasicInfoView,
  },
  {
    path: 'deposit-info',
    name: 'deposit-info',
    component: DepositInfoView,
  },
]
