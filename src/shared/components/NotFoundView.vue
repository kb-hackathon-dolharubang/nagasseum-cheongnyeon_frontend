<script setup>
import { useRouter } from 'vue-router'

import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'
import MobileContainer from '@/shared/components/molecules/MobileContainer.vue'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<template>
  <MobileContainer full-height>
    <div class="not-found-view">
      <div class="not-found-view__intro">
        <div class="not-found-view__logo">🧭</div>
        <h1 class="not-found-view__title">페이지를 찾을 수 없어요</h1>
        <p class="not-found-view__subtitle">주소를 다시 확인해주세요</p>
      </div>

      <BaseButton size="lg" @click="goHome">처음으로 돌아가기</BaseButton>
    </div>
  </MobileContainer>
</template>

<style scoped>
.not-found-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 48px;
  width: 100%;
  min-height: 100vh;
  padding: 64px 24px;
  box-sizing: border-box;
}

.not-found-view__intro {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.not-found-view__logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: #e3f6e8;
  font-size: 28px;
}

.not-found-view__title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-h, #ffffff);
}

.not-found-view__subtitle {
  font-size: 14px;
  color: var(--muted, #8a8a8f);
}
</style>
