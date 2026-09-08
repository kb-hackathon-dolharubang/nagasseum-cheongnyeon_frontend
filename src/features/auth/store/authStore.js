import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

import { loadAuthSession, saveAuthSession, clearAuthSession } from '@/shared/utils/authSession'
import { resetOtherStores } from '@/shared/utils/storeRegistry'

import { signupWithKakao, logout as logoutRequest } from '@/features/auth/api/authApi'

export const useAuthStore = defineStore('auth', () => {
  const session = loadAuthSession()
  const user = ref(session.user ?? null)
  const accessToken = ref(session.accessToken ?? null)
  const refreshToken = ref(session.refreshToken ?? null)

  // 카카오 회원가입 진행 중(닉네임/생년월일 등)에만 쓰는 임시 상태. 세션 저장 대상이 아니며,
  // 새로고침 시 사라져도 되는 값이라 URL 쿼리 대신 메모리에만 둔다.
  const pendingSignup = ref(null)

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
    setPendingSignup,
    loginWithKakaoSession,
    completeKakaoSignup,
    logout,
  }
})
