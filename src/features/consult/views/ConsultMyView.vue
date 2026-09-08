<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import AppHeader from '@/shared/components/molecules/AppHeader.vue'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'
import ConsultationCard from '@/features/consult/components/ConsultationCard.vue'
import { counselors, myConsultations } from '@/features/consult/data/counselors'

const router = useRouter()

function findCounselor(counselorId) {
  return counselors.find((item) => item.id === counselorId) ?? null
}

// "2026-09-09" + "14:00" -> "2026-09-09T14:00"으로 합쳐 문자열 비교만으로 시간순 정렬한다.
function toSortableDateTime(item) {
  return `${item.reservationDate}T${item.reservationTime}`
}

// 예정된 상담: 가장 가까운 상담이 위로 오도록 오름차순.
const upcomingConsultations = computed(() =>
  myConsultations
    .filter((item) => item.status === 'RESERVED' || item.status === 'IN_PROGRESS')
    .slice()
    .sort((a, b) => toSortableDateTime(a).localeCompare(toSortableDateTime(b))),
)

// 지난 상담: 가장 최근에 완료된 상담이 위로 오도록 내림차순.
const pastConsultations = computed(() =>
  myConsultations
    .filter((item) => item.status === 'COMPLETED')
    .slice()
    .sort((a, b) => toSortableDateTime(b).localeCompare(toSortableDateTime(a))),
)

function goToConsultHome() {
  router.push({ name: 'consult' })
}

function goToChat(reservationId) {
  router.push({ name: 'consult-chat', params: { reservationId } })
}

function goToReport(reservationId) {
  router.push({ name: 'consult-report', params: { reservationId } })
}
</script>

<template>
  <div class="consult-my-view">
    <AppHeader title="내 상담" @back="goToConsultHome" />

    <section class="consult-my-view__section">
      <h2 class="consult-my-view__section-title">예정된 상담</h2>

      <div v-if="upcomingConsultations.length" class="consult-my-view__list">
        <ConsultationCard
          v-for="item in upcomingConsultations"
          :key="item.reservationId"
          :reservation-id="item.reservationId"
          :counselor="findCounselor(item.counselorId)"
          :category="item.category"
          :reservation-date="item.reservationDate"
          :reservation-time="item.reservationTime"
          :status="item.status"
          @enter-chat="goToChat"
          @view-report="goToReport"
        />
      </div>

      <div v-else class="consult-my-view__empty">
        <p class="consult-my-view__empty-title">예정된 상담이 없습니다.</p>
        <p class="consult-my-view__empty-desc">상담사를 찾아 나에게 맞는 상담을 예약해보세요.</p>
        <BaseButton variant="text" @click="goToConsultHome">상담사 보기 ›</BaseButton>
      </div>
    </section>

    <section class="consult-my-view__section">
      <h2 class="consult-my-view__section-title">지난 상담</h2>

      <div v-if="pastConsultations.length" class="consult-my-view__list">
        <ConsultationCard
          v-for="item in pastConsultations"
          :key="item.reservationId"
          :reservation-id="item.reservationId"
          :counselor="findCounselor(item.counselorId)"
          :category="item.category"
          :reservation-date="item.reservationDate"
          :reservation-time="item.reservationTime"
          :status="item.status"
          @view-report="goToReport"
        />
      </div>

      <p v-else class="consult-my-view__empty-text">아직 완료된 상담이 없습니다.</p>
    </section>
  </div>
</template>

<style scoped>
.consult-my-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.consult-my-view__section {
  display: flex;
  flex-direction: column;
}

.consult-my-view__section-title {
  margin: 0 0 8px;
  padding: 0 4px;
  font-size: 14.5px;
  font-weight: 600;
  color: var(--color-text-secondary, #9aa09a);
}

.consult-my-view__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ── Empty state ───────────────────────────────────────────── */
/* 상담사 목록이 비었을 때 쓰는 ConsultView__empty와 같은 언어(가운데 정렬, secondary 텍스트)를
   따르되, 예정된 상담 섹션은 안내 문구 + CTA가 더 있어 카드 형태로만 키를 맞춘다. */

.consult-my-view__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 28px 16px;
  text-align: center;
}

.consult-my-view__empty-title {
  margin: 0;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.consult-my-view__empty-desc {
  margin: 0 0 4px;
  font-size: 12.5px;
  color: var(--color-text-secondary, #9aa09a);
}

.consult-my-view__empty-text {
  padding: 24px 0;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-secondary, #9aa09a);
}
</style>
