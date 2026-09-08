import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

import { loadAuthSession, saveAuthSession, clearAuthSession } from '@/shared/utils/authSession'
import { resetOtherStores } from '@/shared/utils/storeRegistry'

import { signupWithKakao, logout as logoutRequest } from '@/features/auth/api/authApi'

// 로컬 개발 전용 fallback. VITE_SKIP_AUTH_GUARD로 로그인을 건너뛴 상태에서도, 상담
// 예약처럼 실제 로그인 사용자 id(userId)를 요청 body에 명시해야 하는 임시 MVP API를
// 계속 테스트할 수 있도록 .env.local에 적어둔 로컬 DB의 실제 member id를 대신 쓴다.
// import.meta.env.DEV는 vite build 결과물에서는 항상 false로 고정되는 빌드 타임 상수라
// (런타임에 조작 불가), VITE_SKIP_AUTH_GUARD 값과 별개로 프로덕션 빌드에서는 이 값이
// 무조건 꺼지도록 이중으로 막아준다.
function resolveDevMemberId() {
  if (!import.meta.env.DEV) return null
  if (import.meta.env.VITE_SKIP_AUTH_GUARD !== 'true') return null

  const parsed = Number(import.meta.env.VITE_DEV_MEMBER_ID)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export const useAuthStore = defineStore('auth', () => {
  const session = loadAuthSession()
  const user = ref(session.user ?? null)
  const accessToken = ref(session.accessToken ?? null)
  const refreshToken = ref(session.refreshToken ?? null)

  // 카카오 회원가입 진행 중(닉네임/생년월일 등)에만 쓰는 임시 상태. 세션 저장 대상이 아니며,
  // 새로고침 시 사라져도 되는 값이라 URL 쿼리 대신 메모리에만 둔다.
  const pendingSignup = ref(null)

  // 실제 로그인 memberId가 최우선이고, 그게 없을 때만(로컬에서 로그인 없이 화면을 보는
  // 개발 상황) dev memberId로 대신한다 - 인증을 대체하는 값이 아니라, 이번 상담 예약
  // API처럼 body에 memberId를 직접 요구하는 화면에서 참고용으로만 쓴다.
  const currentMemberId = computed(() => user.value?.id ?? resolveDevMemberId())

  function setPendingSignup(signupDraft) {
    pendingSignup.value = { ...pendingSignup.value, ...signupDraft }
  }

  watch(
    [user, accessToken, refreshToken],
    ([nextUser, nextAccessToken, nextRefreshToken]) => {
      if (!nextUser && !nextAccessToken && !nextRefreshToken) {
        clearAuthSession()
        return
      }
      saveAuthSession({
        user: nextUser,
        accessToken: nextAccessToken,
        refreshToken: nextRefreshToken,
      })
    },
    { deep: true },
  )

  function loginWithKakaoSession({
    memberId,
    accessToken: nextAccessToken,
    refreshToken: nextRefreshToken,
  }) {
    user.value = { id: memberId }
    accessToken.value = nextAccessToken
    refreshToken.value = nextRefreshToken
  }

  async function completeKakaoSignup({ kakaoId, nickname, birthDate, incomeBracket, agreements }) {
    const response = await signupWithKakao({
      kakaoId,
      nickname,
      birthDate,
      incomeBracket,
      agreements,
    })
    user.value = { id: response.memberId, nickname, birthDate, incomeBracket, agreements }
    accessToken.value = response.accessToken
    refreshToken.value = response.refreshToken
    pendingSignup.value = null
  }

  async function logout() {
    try {
      await logoutRequest()
    } finally {
      user.value = null
      accessToken.value = null
      refreshToken.value = null
      clearAuthSession()
      resetOtherStores('auth')
    }
  }

  return {
    user,
    accessToken,
    refreshToken,
    pendingSignup,
    currentMemberId,
    setPendingSignup,
    loginWithKakaoSession,
    completeKakaoSignup,
    logout,
  }
})
