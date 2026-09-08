<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import AppHeader from '@/shared/components/molecules/AppHeader.vue'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'
import BaseCard from '@/shared/components/atoms/base/card/BaseCard.vue'
import BaseBadge from '@/shared/components/atoms/base/badge/BaseBadge.vue'
import ReservationStepIndicator from '@/features/consult/components/ReservationStepIndicator.vue'
import { formatMonthDayWeekdayKo } from '@/shared/utils/formatter'
import { counselors } from '@/features/consult/data/counselors'

// 상담 정보 화면(2단계)이 예약 확정 시 router state로 넘겨준 값을 그대로 읽는다
// ({ reservationId, counselorId, category, reservationDate, reservationTime, ... }).
// 새 전역 store 없이, 이전 화면들과 같은 방식으로만 이어받는다.
const reservation = window.history.state ?? {}

const router = useRouter()

const counselor = computed(
  () => counselors.find((item) => item.id === Number(reservation.counselorId)) ?? null,
)

// 상담 홈/예약 화면들과 같은 category 코드·라벨을 쓴다. 내부 GENERAL/GOAL_DIAGNOSIS
// 값은 어디에도 노출하지 않는다.
const CATEGORY_LABELS = {
  GOAL_SETTING: '목표 설정',
  SAVING: '저축',
  HOUSING: '주거',
  LOAN: '대출',
  ASSET_MANAGEMENT: '자산 관리',
}

const subjectLabel = computed(() => {
  const label = CATEGORY_LABELS[reservation.category]
  return label ? `${label} 상담` : '상담'
})

// "2026-09-09" + "14:00" -> "9월 9일 수요일 · 14:00"
const scheduleLabel = computed(() => {
  if (!reservation.reservationDate) return ''
  return `${formatMonthDayWeekdayKo(reservation.reservationDate)} · ${reservation.reservationTime ?? ''}`
})

function goToMyConsultations() {
  router.push({ name: 'consult-my' })
}

function goToConsultHome() {
  router.push({ name: 'consult' })
}
</script>

<template>
  <div class="consult-reservation-complete-view">
    <AppHeader title="상담 예약" :show-back="false" />

    <ReservationStepIndicator :current="3" />

    <div class="consult-reservation-complete-view__hero">
      <span class="consult-reservation-complete-view__check" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
          <path
            d="M5 12.5L9.5 17L19 6.5"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
      <p class="consult-reservation-complete-view__title">상담 예약이 완료되었습니다.</p>
      <p class="consult-reservation-complete-view__subtitle">
        예약한 시간에 상담방에 입장해주세요.
      </p>
    </div>

    <template v-if="counselor">
      <BaseCard class="consult-reservation-complete-view__card">
        <div class="consult-reservation-complete-view__counselor">
          <div class="consult-reservation-complete-view__avatar">
            <img
              v-if="counselor.image"
              class="consult-reservation-complete-view__avatar-img"
              :src="counselor.image"
              alt=""
            />
            <span v-else class="consult-reservation-complete-view__avatar-fallback">{{
              counselor.name.charAt(0)
            }}</span>
          </div>
          <p class="consult-reservation-complete-view__counselor-name">
            {{ counselor.name }} 상담사
          </p>
        </div>

        <div class="consult-reservation-complete-view__row">
          <span class="consult-reservation-complete-view__label">상담 분야</span>
          <p class="consult-reservation-complete-view__value">{{ subjectLabel }}</p>
        </div>

        <div class="consult-reservation-complete-view__row">
          <span class="consult-reservation-complete-view__label">예약 일시</span>
          <p class="consult-reservation-complete-view__value">{{ scheduleLabel }}</p>
        </div>

        <div class="consult-reservation-complete-view__row">
          <span class="consult-reservation-complete-view__label">상담 방식</span>
          <p class="consult-reservation-complete-view__value">1:1 채팅 상담</p>
        </div>

        <div class="consult-reservation-complete-view__row">
          <span class="consult-reservation-complete-view__label">예약 상태</span>
          <BaseBadge variant="mint">예약 완료</BaseBadge>
        </div>
      </BaseCard>

      <p class="consult-reservation-complete-view__guide">
        예약 시간에 내 상담에서 상담방에 입장할 수 있습니다.
      </p>
    </template>

    <p v-else class="consult-reservation-complete-view__notice-empty">
      예약 정보를 찾을 수 없어요.
    </p>

    <div class="consult-reservation-complete-view__footer">
      <BaseButton size="lg" @click="goToMyConsultations">내 상담 보기</BaseButton>
      <BaseButton variant="text" @click="goToConsultHome">상담 홈으로</BaseButton>
    </div>
  </div>
</template>

<style scoped>
.consult-reservation-complete-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── 완료 히어로 ───────────────────────────────────────────── */

.consult-reservation-complete-view__hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 0 4px;
  text-align: center;
}

/* GoalChoiceStep의 선택 체크(원형 테두리 + SVG check)와 같은 언어를, 완료 화면에
   맞게 꽉 찬 원(primary 색)으로 키운 버전. 새 아이콘 라이브러리 없이 인라인 SVG만 쓴다. */
.consult-reservation-complete-view__check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: var(--base-button-primary-bg, #e3ffe8);
  color: var(--base-button-primary-text, #16281c);
}

.consult-reservation-complete-view__title {
  margin: 4px 0 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.consult-reservation-complete-view__subtitle {
  margin: 0;
  font-size: 12.5px;
  color: var(--color-text-secondary, #9aa09a);
}

/* ── 예약 정보 카드 ────────────────────────────────────────── */

.consult-reservation-complete-view__card {
  display: flex;
  flex-direction: column;
}

.consult-reservation-complete-view__counselor {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 14px;
  margin-bottom: 14px;
  border-bottom: 1px solid var(--color-border, #262626);
}

.consult-reservation-complete-view__avatar {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  overflow: hidden;
  border-radius: 24px;
  background: var(--color-surface-soft, #cdedd3);
}

.consult-reservation-complete-view__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.consult-reservation-complete-view__avatar-fallback {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-primary, #1d6b3f);
}

.consult-reservation-complete-view__counselor-name {
  margin: 0;
  font-size: 15.5px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.consult-reservation-complete-view__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.consult-reservation-complete-view__row + .consult-reservation-complete-view__row {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--color-border, #262626);
}

.consult-reservation-complete-view__label {
  font-size: 12.5px;
  color: var(--color-text-secondary, #9aa09a);
}

.consult-reservation-complete-view__value {
  margin: 0;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
  text-align: right;
}

/* ── 안내/빈 상태 ──────────────────────────────────────────── */

.consult-reservation-complete-view__guide {
  margin: 0 4px;
  font-size: 12px;
  text-align: center;
  color: var(--color-text-tertiary, #6f766d);
}

.consult-reservation-complete-view__notice-empty {
  padding: 48px 0;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-secondary, #9aa09a);
}

/* ── 푸터 ──────────────────────────────────────────────────── */

.consult-reservation-complete-view__footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 0 8px;
}
</style>
