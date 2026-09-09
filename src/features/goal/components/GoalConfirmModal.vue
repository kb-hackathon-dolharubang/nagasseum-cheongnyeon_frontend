<script setup>
import { computed, ref, watch } from 'vue'

import BaseModal from '@/shared/components/atoms/feedback/BaseModal.vue'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'
import BaseDivider from '@/shared/components/atoms/base/divider/BaseDivider.vue'
import { formatGoalAmount, formatYearMonth } from '@/shared/utils/formatter'
import { toConditionSummary } from '@/features/goal/utils/recommendationViewModel'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  recommendation: { type: Object, default: null },
  selectedLoan: { type: Object, default: null },
  isSaving: { type: Boolean, default: false },
  saveError: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const selectedPlan = ref('loanX')

// 다시 열 때마다 "대출 없이"로 초기화한다 — 이전에 어떤 걸 보고 있었는지와 무관하게
// 항상 같은 기본값에서 시작해야 매번 같은 흐름으로 확인할 수 있다.
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) selectedPlan.value = 'loanX'
  },
)

const hasLoanOption = computed(() => props.selectedLoan?.eligible === true)
const isLoanActive = computed(() => hasLoanOption.value && selectedPlan.value === 'loan')

const activePlan = computed(() => {
  if (!props.recommendation) return null
  return isLoanActive.value ? props.selectedLoan.plan : props.recommendation.loanX
})

const conditionSummary = computed(() =>
  props.recommendation ? toConditionSummary(props.recommendation.condition) : '',
)

function selectPlan(plan) {
  selectedPlan.value = plan
}

function close() {
  emit('update:modelValue', false)
}

function confirm() {
  emit('confirm', activePlan.value)
}
</script>

<template>
  <BaseModal
    class="goal-confirm-modal"
    title="이 계획으로 목표를 설정할까요?"
    :model-value="modelValue"
    @update:model-value="close"
  >
    <template v-if="recommendation">
      <p class="goal-confirm-modal__subtitle">저장할 계획의 내용을 확인해주세요.</p>

      <div v-if="hasLoanOption" class="goal-confirm-modal__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          class="goal-confirm-modal__tab"
          :class="{ 'goal-confirm-modal__tab--active': !isLoanActive }"
          :aria-selected="!isLoanActive"
          @click="selectPlan('loanX')"
        >
          대출 없이
        </button>
        <button
          type="button"
          role="tab"
          class="goal-confirm-modal__tab"
          :class="{ 'goal-confirm-modal__tab--active': isLoanActive }"
          :aria-selected="isLoanActive"
          @click="selectPlan('loan')"
        >
          {{ selectedLoan.productName }}
        </button>
      </div>

      <p class="goal-confirm-modal__section-label">주거 조건</p>
      <p class="goal-confirm-modal__condition">{{ conditionSummary }}</p>

      <BaseDivider class="goal-confirm-modal__divider" />

      <div class="goal-confirm-modal__row">
        <span class="goal-confirm-modal__row-label">목표 금액</span>
        <strong class="goal-confirm-modal__row-value">{{
          formatGoalAmount(activePlan.targetAmount)
        }}</strong>
      </div>
      <div class="goal-confirm-modal__row">
        <span class="goal-confirm-modal__row-label">월 저축</span>
        <strong class="goal-confirm-modal__row-value">{{
          formatGoalAmount(activePlan.monthlySaving)
        }}</strong>
      </div>
      <div class="goal-confirm-modal__row">
        <span class="goal-confirm-modal__row-label">목표 시점</span>
        <strong class="goal-confirm-modal__row-value">{{
          formatYearMonth(activePlan.targetDate)
        }}</strong>
      </div>
      <div v-if="isLoanActive" class="goal-confirm-modal__row">
        <span class="goal-confirm-modal__row-label">예상 대출 금액</span>
        <strong class="goal-confirm-modal__row-value">{{
          formatGoalAmount(activePlan.loanAmount)
        }}</strong>
      </div>

      <p v-if="saveError" class="goal-confirm-modal__error">
        {{ saveError?.message ?? '목표 저장에 실패했어요.' }}
      </p>
    </template>

    <template #footer>
      <BaseButton
        variant="secondary"
        class="goal-confirm-modal__btn"
        :disabled="isSaving"
        @click="close"
      >
        취소
      </BaseButton>
      <BaseButton
        variant="primary"
        class="goal-confirm-modal__btn"
        :disabled="isSaving"
        @click="confirm"
      >
        {{ isSaving ? '설정 중...' : '목표 설정하기' }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.goal-confirm-modal {
  width: 90vw;
  max-width: 340px;
}

.goal-confirm-modal__subtitle {
  margin: -6px 0 14px;
  color: var(--color-text-secondary, #9aa09a);
  font-size: 12.5px;
  text-align: center;
}

.goal-confirm-modal__tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  padding: 4px;
  margin-bottom: 16px;
  border-radius: 14px;
  background: var(--color-app-bg, #111111);
  border: 1px solid var(--color-border, #262626);
}

.goal-confirm-modal__tab {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 10px;
  padding: 9px 0;
  background: none;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary, #9aa09a);
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    color 0.18s ease;
}

.goal-confirm-modal__tab--active {
  background: var(--color-primary-soft, #e8f4ea);
  color: var(--color-primary, #1d6b3f);
}

.goal-confirm-modal__section-label {
  margin: 0 0 4px;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-secondary, #9aa09a);
}

.goal-confirm-modal__condition {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary, #ffffff);
  line-height: 1.4;
}

.goal-confirm-modal__divider {
  margin: 14px 0 10px;
  background: var(--color-border, #262626);
}

.goal-confirm-modal__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 0;
}

.goal-confirm-modal__row + .goal-confirm-modal__row {
  border-top: 1px solid var(--color-border, #262626);
}

.goal-confirm-modal__row-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary, #9aa09a);
}

.goal-confirm-modal__row-value {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.goal-confirm-modal__error {
  margin: 12px 0 0;
  color: var(--color-point, #c1442e);
  font-size: 12px;
  text-align: center;
}

.goal-confirm-modal__btn {
  height: 46px;
  flex: 1;
}
</style>
