<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'

import { getKakaoCallback } from '@/features/auth/api/authApi'
import { useAuthStore } from '@/features/auth/store/authStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const errorMessage = ref('')

function goToLogin() {
  router.replace({ name: 'login' })
}

onMounted(async () => {
  const code = route.query.code
  if (!code) {
    errorMessage.value = '잘못된 접근입니다. 카카오 로그인을 다시 시도해주세요.'
    return
  }

  try {
    const result = await getKakaoCallback(code)

    if (result.status === 'SIGNUP_REQUIRED') {
      authStore.setPendingSignup({ kakaoId: result.kakaoId, nickname: result.kakaoNickname ?? '' })
      router.replace({ name: 'callback-signup' })
      return
    }

    if (result.status !== 'LOGIN') {
      errorMessage.value = '카카오 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.'
      return
    }

    authStore.loginWithKakaoSession(result)
    router.replace({ name: 'home' })
  } catch (error) {
    errorMessage.value =
      error.response?.data?.error?.message ??
      '카카오 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.'
  }
})
</script>

<template>
  <div class="callback-login-view">
    <template v-if="errorMessage">
      <p class="callback-login-view__error">{{ errorMessage }}</p>
      <BaseButton size="lg" @click="goToLogin">로그인 화면으로 돌아가기</BaseButton>
    </template>
    <p v-else class="callback-login-view__loading">로그인 처리 중...</p>
  </div>
</template>

<style scoped>
.callback-login-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  width: 100%;
  min-height: 300px;
  padding: 24px;
}

.callback-login-view__loading {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.callback-login-view__error {
  margin: 0;
  font-size: 14px;
  color: #e03131;
  text-align: center;
}
</style>
