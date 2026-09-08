<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppHeader from '@/shared/components/molecules/AppHeader.vue'
import BaseCard from '@/shared/components/atoms/base/card/BaseCard.vue'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'
import BaseBadge from '@/shared/components/atoms/base/badge/BaseBadge.vue'
import BaseChipGroup from '@/shared/components/atoms/form/ChipGroup/BaseChipGroup.vue'
import CounselorCard from '@/features/consult/components/CounselorCard.vue'
import {
  recentDiagnosisGoal,
  myConsultation,
  counselors,
  HAS_RECENT_DIAGNOSIS,
  HAS_MY_CONSULTATION,
} from '@/features/consult/data/counselors'
import { CATEGORY_OPTIONS as CONSULT_CATEGORY_OPTIONS } from '@/features/consult/constants/categories'

const router = useRouter()

// 원본 Mock은 다른 화면들도 참조하고 있어 그대로 두고, 상담 홈만 플래그로
// "있는 것으로 볼지"를 가른다 - false면 null과 같은 취급이라 아래 템플릿이
// Empty State 쪽으로 자연스럽게 갈라진다.
const diagnosisGoal = computed(() => (HAS_RECENT_DIAGNOSIS ? recentDiagnosisGoal : null))
const myConsultationData = computed(() => (HAS_MY_CONSULTATION ? myConsultation : null))

const MY_CONSULTATION_STATUS_LABELS = {
  RESERVED: '예정된 상담',
}

const statusLabel = computed(
  () => MY_CONSULTATION_STATUS_LABELS[myConsultationData.value?.status] ?? '예정된 상담',
)

// "2026-09-09" + "14:00" -> "9월 9일 14:00". 목데이터가 날짜/시간을 따로 들고 있어 화면
// 표시 시점에만 합친다.
const myConsultationDateTimeLabel = computed(() => {
  if (!myConsultationData.value) return ''
  const date = new Date(myConsultationData.value.date)
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${myConsultationData.value.time}`
})

const CATEGORY_OPTIONS = [{ label: '전체', value: 'ALL' }, ...CONSULT_CATEGORY_OPTIONS]

// 상담사 목록 필터 조건으로 그대로 쓰인다.
const selectedCategory = ref('ALL')

// '상담사 보기'(최근 진단 목표 카드)로 들어왔는지. true면 예약 화면에서 목표 진단 연계
// 상담(GOAL_DIAGNOSIS)으로, 아니면 분야 칩 기준 일반 상담(GENERAL)으로 이어간다.
const cameFromGoalDiagnosis = ref(false)

const selectedCategoryLabel = computed(
  () => CATEGORY_OPTIONS.find((option) => option.value === selectedCategory.value)?.label,
)

function handleCategorySelect(value) {
  selectedCategory.value = value
  cameFromGoalDiagnosis.value = false
}

// Mock 데이터의 categories는 분야 칩과 같은 한글 라벨을 쓰므로, 선택된 칩의 라벨로 바로
// 걸러낸다. '전체'는 라벨 자체가 데이터에 없어 별도로 통과시킨다.
const filteredCounselors = computed(() => {
  if (selectedCategory.value === 'ALL') return counselors
  return counselors.filter((counselor) =>
    counselor.categories.includes(selectedCategoryLabel.value),
  )
})

function goToReservation(counselorId) {
  // '전체'는 특정 분야를 고른 것이 아니라 null로 넘긴다. 예약 화면들은 이 값을 그대로
  // 받아 상담 정보 단계까지 이어서 전달하기만 한다(router state라 URL에는 남지 않는다).
  const category = selectedCategory.value === 'ALL' ? null : selectedCategory.value
  const consultationType = cameFromGoalDiagnosis.value ? 'GOAL_DIAGNOSIS' : 'GENERAL'
  router.push({
    name: 'consult-reservation',
    params: { counselorId },
    state: { category, consultationType },
  })
}

function handleViewCounselors() {
  // 최근 진단 목표를 들고 온 흐름임을 표시해 예약 화면까지 이어간다. 분야 칩은 이
  // 흐름과 무관하므로 '전체'로 되돌린다.
  selectedCategory.value = 'ALL'
  cameFromGoalDiagnosis.value = true
}

function handleViewMyConsultations() {
  router.push({ name: 'consult-my' })
}

// 목표 진단 시작 화면. 새 화면을 만들지 않고 기존 라우트를 그대로 쓴다 - 홈/목표
// 빈 화면도 같은 이름('diagnosis')으로 이동한다.
function goToDiagnosis() {
  router.push({ name: 'diagnosis' })
}

// 예약된 상담이 없을 때 '상담사 보기'를 누르면 새 페이지 대신 같은 화면 아래
// 상담사 목록 영역으로 부드럽게 스크롤한다.
const counselorSectionRef = ref(null)
function scrollToCounselors() {
  counselorSectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="consult-view consult-view--animated">
    <AppHeader title="상담" :show-back="false" />

    <BaseCard class="consult-view__goal-card">
      <template v-if="diagnosisGoal">
        <p class="consult-view__goal-heading">최근 진단한 목표가 있어요</p>
        <p class="consult-view__goal-summary">
          {{ diagnosisGoal.region }} · {{ diagnosisGoal.transactionType }}
        </p>
        <p class="consult-view__goal-date">목표 시점 {{ diagnosisGoal.targetDate }}</p>
        <p class="consult-view__goal-desc">전문가와 함께 진단 결과를 검토해보세요.</p>
        <BaseButton
          class="consult-view__goal-cta"
          variant="primary"
          size="lg"
          @click="handleViewCounselors"
        >
          상담사 보기
        </BaseButton>
      </template>
      <template v-else>
        <p class="consult-view__goal-heading">아직 진단한 목표가 없어요</p>
        <p class="consult-view__goal-desc">
          희망 주거 조건과 자산 정보를 바탕으로 목표를 먼저 진단해볼 수 있어요.
        </p>
        <BaseButton
          class="consult-view__goal-cta"
          variant="primary"
          size="lg"
          @click="goToDiagnosis"
        >
          목표 진단하기
        </BaseButton>
      </template>
    </BaseCard>

    <section class="consult-view__section">
      <h2 class="consult-view__section-title">내 상담</h2>
      <BaseCard class="consult-view__my-consult-card">
        <template v-if="myConsultationData">
          <BaseBadge variant="mint">{{ statusLabel }}</BaseBadge>
          <p class="consult-view__my-consult-counselor">
            {{ myConsultationData.counselorName }} 상담사
          </p>
          <p class="consult-view__my-consult-category">{{ myConsultationData.category }}</p>
          <p class="consult-view__my-consult-datetime">{{ myConsultationDateTimeLabel }}</p>
          <BaseButton
            class="consult-view__my-consult-cta"
            variant="text"
            @click="handleViewMyConsultations"
          >
            내 상담 보기 ›
          </BaseButton>
        </template>
        <template v-else>
          <p class="consult-view__my-consult-empty-title">예정된 상담이 없어요</p>
          <p class="consult-view__my-consult-empty-desc">
            아래에서 원하는 상담 분야와 상담사를 선택해 상담을 예약해보세요.
          </p>
          <BaseButton
            class="consult-view__my-consult-cta"
            variant="text"
            @click="scrollToCounselors"
          >
            상담사 보기 ›
          </BaseButton>
        </template>
      </BaseCard>
    </section>

    <section ref="counselorSectionRef" class="consult-view__section">
      <h2 class="consult-view__section-title">어떤 상담이 필요하신가요?</h2>
      <BaseChipGroup
        :model-value="selectedCategory"
        :options="CATEGORY_OPTIONS"
        size="sm"
        @update:model-value="handleCategorySelect"
      />
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

/* 예약된 상담이 없을 때. 뱃지/시간 정보 없이 제목+설명 2줄 정도로 간결하게 두어
   아래 상담 분야·상담사 목록이 과도하게 밀려나지 않게 한다. */
.consult-view__my-consult-empty-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.consult-view__my-consult-empty-desc {
  margin: 4px 0 0;
  font-size: 12.5px;
  color: var(--color-text-secondary, #9aa09a);
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
