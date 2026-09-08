<script setup>
import { useRouter } from 'vue-router'

import AppHeader from '@/shared/components/molecules/AppHeader.vue'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'

// 예약 완료 화면의 실제 내용은 이번 범위 밖이라, 상담 정보 화면이 router state로 넘긴
// 최종 예약 데이터가 잘 도착하는지만 확인하는 placeholder다.
const router = useRouter()

const reservation = window.history.state ?? {}

function goToConsultHome() {
  router.push({ name: 'consult' })
}
</script>

<template>
  <div class="consult-reservation-complete-view">
    <AppHeader title="예약 완료" :show-back="false" />

    <div class="consult-reservation-complete-view__body">
      <p class="consult-reservation-complete-view__title">예약 완료 화면을 준비 중이에요</p>
      <p v-if="reservation.reservationDate" class="consult-reservation-complete-view__summary">
        {{ reservation.reservationDate }} {{ reservation.reservationTime }} 예약 요청을 받았어요.
      </p>
      <BaseButton size="lg" @click="goToConsultHome">상담 홈으로</BaseButton>
    </div>
  </div>
</template>

<style scoped>
.consult-reservation-complete-view {
  display: flex;
  flex-direction: column;
}

.consult-reservation-complete-view__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 64px 16px;
  text-align: center;
}

.consult-reservation-complete-view__title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.consult-reservation-complete-view__summary {
  margin: 0 0 8px;
  font-size: 13px;
  color: var(--color-text-secondary, #9aa09a);
}
</style>
