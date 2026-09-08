<script setup>
import { useRouter } from 'vue-router'

import AppHeader from '@/shared/components/molecules/AppHeader.vue'
import { formatMonthDayWeekdayKo } from '@/shared/utils/formatter'
import { counselors } from '@/features/consult/data/counselors'

// 상담 정보 입력(2단계)의 실제 내용은 이번 범위 밖이라, 이전 화면(날짜·시간 선택)이
// router state로 넘긴 값이 잘 도착하는지만 확인하는 placeholder다.
defineProps({
  counselorId: { type: String, required: true },
})

const router = useRouter()

const reservationState = window.history.state ?? {}
const counselor = counselors.find(
  (item) => item.id === Number(router.currentRoute.value.params.counselorId),
)
</script>

<template>
  <div class="consult-reservation-info-view">
    <AppHeader title="상담 정보" @back="router.back()" />

    <div class="consult-reservation-info-view__body">
      <p class="consult-reservation-info-view__title">상담 정보 입력 화면을 준비 중이에요</p>
      <p v-if="counselor" class="consult-reservation-info-view__summary">
        {{ counselor.name }} 상담사 ·
        {{ reservationState.date ? formatMonthDayWeekdayKo(reservationState.date) : '' }}
        {{ reservationState.time }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.consult-reservation-info-view {
  display: flex;
  flex-direction: column;
}

.consult-reservation-info-view__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 64px 16px;
  text-align: center;
}

.consult-reservation-info-view__title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.consult-reservation-info-view__summary {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-secondary, #9aa09a);
}
</style>
