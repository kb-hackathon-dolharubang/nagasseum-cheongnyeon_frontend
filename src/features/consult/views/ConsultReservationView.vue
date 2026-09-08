<script setup>
import { useRouter } from 'vue-router'

import AppHeader from '@/shared/components/molecules/AppHeader.vue'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'

// 예약 기능은 이번 범위 밖이라, 상담사 카드의 "예약하기"가 향할 라우트만 미리
// 준비해두는 placeholder 화면이다. 예약 플로우가 만들어지면 이 파일을 교체한다.
defineProps({
  counselorId: { type: String, required: true },
})

const router = useRouter()

function goBack() {
  router.push({ name: 'consult' })
}
</script>

<template>
  <div class="consult-reservation-view">
    <AppHeader title="상담 예약" @back="goBack" />

    <div class="consult-reservation-view__body">
      <p class="consult-reservation-view__title">예약 기능을 준비 중이에요</p>
      <p class="consult-reservation-view__desc">
        조금만 기다려주시면 상담 예약을 이용하실 수 있어요.
      </p>
      <BaseButton size="lg" @click="goBack">상담 목록으로 돌아가기</BaseButton>
    </div>
  </div>
</template>

<style scoped>
.consult-reservation-view {
  display: flex;
  flex-direction: column;
}

.consult-reservation-view__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 64px 16px;
  text-align: center;
}

.consult-reservation-view__title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.consult-reservation-view__desc {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--color-text-secondary, #9aa09a);
}
</style>
