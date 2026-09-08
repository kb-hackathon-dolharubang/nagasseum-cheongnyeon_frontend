<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppHeader from '@/shared/components/molecules/AppHeader.vue'
import BaseCard from '@/shared/components/atoms/base/card/BaseCard.vue'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'
import BaseBadge from '@/shared/components/atoms/base/badge/BaseBadge.vue'
import BaseChipGroup from '@/shared/components/atoms/form/ChipGroup/BaseChipGroup.vue'
import CounselorCard from '@/features/consult/components/CounselorCard.vue'
import { recentDiagnosisGoal, myConsultation, counselors } from '@/features/consult/data/counselors'

const router = useRouter()

const MY_CONSULTATION_STATUS_LABELS = {
  RESERVED: '예정된 상담',
}

const statusLabel = computed(
  () => MY_CONSULTATION_STATUS_LABELS[myConsultation.status] ?? '예정된 상담',
)

// "2026-09-09" + "14:00" -> "9월 9일 14:00". 목데이터가 날짜/시간을 따로 들고 있어 화면
// 표시 시점에만 합친다.
const myConsultationDateTimeLabel = computed(() => {
  const date = new Date(myConsultation.date)
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${myConsultation.time}`
})

const CATEGORY_OPTIONS = [
  { label: '전체', value: 'ALL' },
  { label: '목표 설정', value: 'GOAL_SETTING' },
  { label: '저축', value: 'SAVING' },
  { label: '주거', value: 'HOUSING' },
  { label: '대출', value: 'LOAN' },
  { label: '자산 관리', value: 'ASSET_MANAGEMENT' },
]

// 상담사 목록 필터 조건으로 그대로 쓰인다.
const selectedCategory = ref('ALL')

const selectedCategoryLabel = computed(
  () => CATEGORY_OPTIONS.find((option) => option.value === selectedCategory.value)?.label,
)

// Mock 데이터의 categories는 분야 칩과 같은 한글 라벨을 쓰므로, 선택된 칩의 라벨로 바로
// 걸러낸다. '전체'는 라벨 자체가 데이터에 없어 별도로 통과시킨다.
const filteredCounselors = computed(() => {
  if (selectedCategory.value === 'ALL') return counselors
  return counselors.filter((counselor) =>
    counselor.categories.includes(selectedCategoryLabel.value),
  )
})

function goToReservation(counselorId) {
  router.push({ name: 'consult-reservation', params: { counselorId } })
}

function handleViewCounselors() {
  // 상담사 목록 화면이 아직 없어 클릭 지점만 마련해둔다. 목록이 생기면 여기서 이동시킨다.
}

function handleViewMyConsultations() {
  // /consult/my 라우트가 아직 없어 클릭 지점만 마련해둔다. 라우트가 생기면
  // router.push({ name: 'consult-my' })로 교체한다.
}
</script>

<template>
  <div class="consult-view consult-view--animated">
    <AppHeader title="상담" :show-back="false" />

    <BaseCard class="consult-view__goal-card">
      <p class="consult-view__goal-heading">최근 진단한 목표가 있어요</p>
      <p class="consult-view__goal-summary">
        {{ recentDiagnosisGoal.region }} · {{ recentDiagnosisGoal.transactionType }}
      </p>
      <p class="consult-view__goal-date">목표 시점 {{ recentDiagnosisGoal.targetDate }}</p>
      <p class="consult-view__goal-desc">전문가와 함께 진단 결과를 검토해보세요.</p>
      <BaseButton
        class="consult-view__goal-cta"
        variant="primary"
        size="lg"
        @click="handleViewCounselors"
      >
        상담사 보기
      </BaseButton>
    </BaseCard>

    <section class="consult-view__section">
      <h2 class="consult-view__section-title">내 상담</h2>
      <BaseCard class="consult-view__my-consult-card">
        <BaseBadge variant="mint">{{ statusLabel }}</BaseBadge>
        <p class="consult-view__my-consult-counselor">{{ myConsultation.counselorName }} 상담사</p>
        <p class="consult-view__my-consult-category">{{ myConsultation.category }}</p>
        <p class="consult-view__my-consult-datetime">{{ myConsultationDateTimeLabel }}</p>
        <BaseButton
          class="consult-view__my-consult-cta"
          variant="text"
          @click="handleViewMyConsultations"
        >
          내 상담 보기 ›
        </BaseButton>
      </BaseCard>
    </section>

    <section class="consult-view__section">
      <h2 class="consult-view__section-title">어떤 상담이 필요하신가요?</h2>
      <BaseChipGroup v-model="selectedCategory" :options="CATEGORY_OPTIONS" size="sm" />
    </section>

    <div class="consult-view__counselor-list">
      <CounselorCard
        v-for="counselor in filteredCounselors"
        :key="counselor.id"
        :counselor="counselor"
        @reserve="goToReservation"
      />
      <p v-if="filteredCounselors.length === 0" class="consult-view__empty">
        해당 분야의 상담사가 없습니다.
      </p>
    </div>
  </div>
</template>

<style scoped>
.consult-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.consult-view--animated > * {
  animation: card-rise 0.35s ease-out both;
}

.consult-view--animated > *:nth-child(2) {
  animation-delay: 0.04s;
}

.consult-view--animated > *:nth-child(3) {
  animation-delay: 0.08s;
}

.consult-view--animated > *:nth-child(4) {
  animation-delay: 0.12s;
}

.consult-view--animated > *:nth-child(5) {
  animation-delay: 0.16s;
}

.consult-view__section {
  display: flex;
  flex-direction: column;
}

.consult-view__section-title {
  margin: 0 0 8px;
  padding: 0 4px;
  font-size: 14.5px;
  font-weight: 600;
  color: var(--color-text-secondary, #9aa09a);
}

/* ── 최근 진단 목표 카드 ────────────────────────────────────── */

.consult-view__goal-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.consult-view__goal-heading {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.consult-view__goal-summary {
  margin: 6px 0 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.consult-view__goal-date {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-tertiary, #6f766d);
}

.consult-view__goal-desc {
  margin: 10px 0 0;
  font-size: 12.5px;
  color: var(--color-text-secondary, #9aa09a);
}

.consult-view__goal-cta {
  margin-top: 12px;
}

/* ── 내 상담 카드 ──────────────────────────────────────────── */

.consult-view__my-consult-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.consult-view__my-consult-counselor {
  margin: 8px 0 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.consult-view__my-consult-category {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-secondary, #9aa09a);
}

.consult-view__my-consult-datetime {
  margin: 4px 0 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-tertiary, #6f766d);
}

.consult-view__my-consult-cta {
  align-self: flex-end;
  margin-top: 6px;
}

/* ── 상담사 카드 목록 ──────────────────────────────────────── */

.consult-view__counselor-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.consult-view__empty {
  padding: 24px 0;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-secondary, #9aa09a);
}
</style>
