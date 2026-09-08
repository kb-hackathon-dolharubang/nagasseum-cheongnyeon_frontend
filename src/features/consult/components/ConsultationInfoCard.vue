<script setup>
import { computed } from 'vue'

import BaseCard from '@/shared/components/atoms/base/card/BaseCard.vue'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'
import { formatWon, formatYearMonthFlexibleKo } from '@/shared/utils/formatter'
import { recentDiagnosisGoal } from '@/features/consult/data/counselors'

const props = defineProps({
  consultationType: { type: String, required: true }, // 'GOAL_DIAGNOSIS' | 'GENERAL'
  // 상담용으로 관리 중인 값(원본 서비스 데이터가 아니라 이 예약 화면의 로컬 상태).
  // { housingPreference, currentAsset, monthlySaving, targetDate, loanPreference }
  consultationData: { type: Object, required: true },
})

const emit = defineEmits(['open-sheet'])

const isGoalDiagnosis = computed(() => props.consultationType === 'GOAL_DIAGNOSIS')

// HousingPreferenceSelect(상담 정보 Bottom Sheet)와 같은 enum 값을 쓴다 - 화면 표시용
// 한글 라벨만 여기서 한 번 더 매핑한다.
const HOUSING_TYPE_LABELS = {
  APT: '아파트',
  OFFICETEL: '오피스텔',
  ROW_HOUSE: '연립·다세대',
  DETACHED: '단독·다가구',
}
const TRANSACTION_TYPE_LABELS = {
  JEONSE: '전세',
  WOLSE: '월세',
}

function formatHousingPreference(pref) {
  if (!pref) return null
  const regionLabel = [pref.province?.name, pref.district?.name, pref.neighborhood?.name]
    .filter(Boolean)
    .join(' ')
  return [
    regionLabel,
    HOUSING_TYPE_LABELS[pref.housingType] ?? pref.housingType,
    TRANSACTION_TYPE_LABELS[pref.transactionType] ?? pref.transactionType,
    pref.areaRange?.label,
  ]
    .filter(Boolean)
    .join(' · ')
}

const isComplete = computed(
  () =>
    Boolean(props.consultationData.housingPreference) &&
    props.consultationData.currentAsset != null &&
    props.consultationData.monthlySaving != null &&
    Boolean(props.consultationData.targetDate),
)

// GOAL_DIAGNOSIS는 기존 진단 결과(추천 조건/추천 월 저축액 - 수정 불가)에 사용자가 상담
// 정보 Bottom Sheet에서 채운 값(현재 희망 조건/현재 자산/월 저축 가능액/목표 시점)을 더해
// 보여준다. GENERAL은 그 사용자 값 4개만 보여준다.
const rows = computed(() => {
  const data = props.consultationData

  if (isGoalDiagnosis.value) {
    return [
      { label: '현재 희망 조건', value: formatHousingPreference(data.housingPreference) },
      {
        label: '추천 조건',
        value: formatHousingPreference(recentDiagnosisGoal.recommendedCondition),
      },
      {
        label: '현재 자산',
        value: data.currentAsset != null ? formatWon(data.currentAsset) : null,
      },
      {
        label: '월 저축 가능액',
        value: data.monthlySaving != null ? formatWon(data.monthlySaving) : null,
      },
      {
        label: '목표 시점',
        value: data.targetDate ? formatYearMonthFlexibleKo(data.targetDate) : null,
      },
      { label: '추천 월 저축액', value: formatWon(recentDiagnosisGoal.recommendedMonthlySaving) },
    ]
  }

  return [
    { label: '희망 주거 조건', value: formatHousingPreference(data.housingPreference) },
    { label: '현재 자산', value: data.currentAsset != null ? formatWon(data.currentAsset) : null },
    {
      label: '월 저축 가능액',
      value: data.monthlySaving != null ? formatWon(data.monthlySaving) : null,
    },
    {
      label: '목표 시점',
      value: data.targetDate ? formatYearMonthFlexibleKo(data.targetDate) : null,
    },
  ]
})
</script>

<template>
  <BaseCard class="consultation-info-card">
    <template v-if="isComplete">
      <div v-for="row in rows" :key="row.label" class="consultation-info-card__row">
        <span class="consultation-info-card__label">{{ row.label }}</span>
        <p class="consultation-info-card__value">{{ row.value }}</p>
      </div>
    </template>

    <div v-else class="consultation-info-card__empty">
      <p class="consultation-info-card__empty-text">상담을 위해 필요한 정보를 입력해주세요.</p>
      <BaseButton variant="primary" size="md" @click="emit('open-sheet')">정보 입력</BaseButton>
    </div>
  </BaseCard>
</template>

<style scoped>
.consultation-info-card {
  display: flex;
  flex-direction: column;
}

.consultation-info-card__row + .consultation-info-card__row {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--color-border, #262626);
}

.consultation-info-card__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary, #9aa09a);
}

.consultation-info-card__value {
  margin: 2px 0 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.consultation-info-card__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  text-align: center;
}

.consultation-info-card__empty-text {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-secondary, #9aa09a);
}
</style>
