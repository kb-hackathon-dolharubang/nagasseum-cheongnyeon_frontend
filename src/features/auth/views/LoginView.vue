<script setup>
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'

import kakaoIcon from '@/assets/images/kakao-icon.png'

function handleKakaoLogin() {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: import.meta.env.VITE_KAKAO_CLIENT_ID,
    redirect_uri: import.meta.env.VITE_KAKAO_REDIRECT_URI,
  })

  window.location.href = `https://kauth.kakao.com/oauth/authorize?${params.toString()}`
}
</script>

<template>
  <div class="login-view">
    <div class="login-view__intro">
      <div class="login-view__logo">🏠</div>
      <h1 class="login-view__title">나갔음 청년</h1>
      <p class="login-view__subtitle">내 집 정상까지, 한 걸음씩</p>
    </div>

    <div class="login-view__action">
      <BaseButton class="login-view__kakao-button" size="lg" @click="handleKakaoLogin">
        <img class="login-view__kakao-icon" :src="kakaoIcon" alt="" />
        카카오로 5초만에 시작하기
      </BaseButton>
      <p class="login-view__terms">가입 시 이용약관 및 개인정보처리방침에 동의합니다</p>
    </div>
  </div>
</template>

<style scoped>
.login-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 48px;
  width: 100%;
  min-height: 600px;
  padding: 64px 24px;
}

.login-view__intro {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: auto;
}

.login-view__logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: #e3f6e8;
  font-size: 28px;
}

/*
  색을 안 주면 루트의 --text(#9aa09a)를 물려받는다. 밝은 배경에서 2.5:1이라
  제목이 부제보다 흐려 보였다.
*/
.login-view__title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.login-view__subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.login-view__action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  margin-top: auto;
}

.login-view__terms {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.login-view__kakao-button {
  gap: 8px;
  background: var(--color-kakao-bg, #fee500);
  color: var(--color-kakao-text, #191600);
}

.login-view__kakao-icon {
  display: block;
  width: 20px;
  height: 20px;
}
</style>
