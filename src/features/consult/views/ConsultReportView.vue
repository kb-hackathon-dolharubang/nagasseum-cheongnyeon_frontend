<script setup>
import { useRouter } from 'vue-router'

import AppHeader from '@/shared/components/molecules/AppHeader.vue'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'

// AI 상담 리포트 화면 자체는 이번 범위 밖이라, 완료된 상담 카드의 '상담 리포트 보기'가
// 향할 라우트만 미리 준비해두는 placeholder다.
const router = useRouter()

function goToMyConsultations() {
  router.push({ name: 'consult-my' })
}
</script>

<template>
  <div class="consult-report-view">
    <AppHeader title="상담 리포트" @back="goToMyConsultations" />

    <div class="consult-report-view__body">
      <p class="consult-report-view__title">상담 리포트를 준비 중이에요</p>
      <p class="consult-report-view__desc">
        곧 이곳에서 완료된 상담의 요약과 제안을 확인할 수 있게 될 예정이에요.
      </p>
      <BaseButton size="lg" @click="goToMyConsultations">내 상담으로 돌아가기</BaseButton>
    </div>
  </div>
</template>

<style scoped>
.consult-report-view {
  display: flex;
  flex-direction: column;
}

.consult-report-view__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 64px 16px;
  text-align: center;
}

.consult-report-view__title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.consult-report-view__desc {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--color-text-secondary, #9aa09a);
}
</style>
