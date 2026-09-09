<script setup>
import { computed } from 'vue'

import BaseCard from '@/shared/components/atoms/base/card/BaseCard.vue'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'
import { buildConsultationInfoRows } from '@/features/consult/utils/consultInfo'

const props = defineProps({
  consultationType: { type: String, required: true }, // 'GOAL_DIAGNOSIS' | 'GENERAL'
  // 상담용으로 관리 중인 값(원본 서비스 데이터가 아니라 이 예약 화면의 로컬 상태).
  // { housingPreference, currentAsset, monthlySaving, targetDate, loanPreference }
  consultationData: { type: Object, required: true },
})

const emit = defineEmits(['open-sheet'])

const isComplete = computed(
  () =>
    Boolean(props.consultationData.housingPreference) &&
    props.consultationData.currentAsset != null &&
    props.consultationData.monthlySaving != null &&
    Boolean(props.consultationData.targetDate),
)

// 라벨/포맷팅 로직은 상담 리포트 화면과 공유한다(buildConsultationInfoRows 참고).
const rows = computed(() =>
  buildConsultationInfoRows(props.consultationType, props.consultationData),
)
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
