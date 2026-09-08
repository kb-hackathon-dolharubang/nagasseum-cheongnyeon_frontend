<script setup>
import { useRouter } from 'vue-router'

import AppHeader from '@/shared/components/molecules/AppHeader.vue'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'

// 내 상담 목록 화면의 실제 내용은 이번 범위 밖이라, 예약 완료 화면의 '내 상담 보기'가
// 향할 라우트만 미리 준비해두는 placeholder다.
const router = useRouter()

function goToConsultHome() {
  router.push({ name: 'consult' })
}
</script>

<template>
  <div class="consult-my-view">
    <AppHeader title="내 상담" @back="goToConsultHome" />

    <div class="consult-my-view__body">
      <p class="consult-my-view__title">내 상담 목록을 준비 중이에요</p>
      <p class="consult-my-view__desc">예약한 상담은 이곳에서 확인할 수 있게 될 예정이에요.</p>
      <BaseButton size="lg" @click="goToConsultHome">상담 홈으로</BaseButton>
    </div>
  </div>
</template>

<style scoped>
.consult-my-view {
  display: flex;
  flex-direction: column;
}

.consult-my-view__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 64px 16px;
  text-align: center;
}

.consult-my-view__title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.consult-my-view__desc {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--color-text-secondary, #9aa09a);
}
</style>
