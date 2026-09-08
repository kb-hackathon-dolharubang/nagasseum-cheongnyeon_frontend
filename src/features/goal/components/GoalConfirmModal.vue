<script setup>
import { computed, ref, watch } from 'vue'

import BaseModal from '@/shared/components/atoms/feedback/Modal/BaseModal.vue'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'
import BaseDivider from '@/shared/components/atoms/base/divider/BaseDivider.vue'
import { formatGoalAmount, formatYearMonth } from '@/shared/utils/formatter'
import { toConditionSummary } from '@/features/goal/utils/recommendationViewModel'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  // recommendation 원본 그대로(condition/loanX/loanO). type별로 팝업을 따로 만들지 않고
  // 이 컴포넌트 하나가 네 type(PREFERENCE_SAVING_FIXED/PREFERENCE_DATE_FIXED/REALISTIC/
  // HOLD_OUT) 전부를 공통으로 그린다.
  recommendation: { type: Object, default: null },
  isSaving: { type: Boolean, default: false },
  saveError: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const LOAN_X = 'loanX'
const LOAN_O = 'loanO'

const selectedPlan = ref(LOAN_X)

// 다시 열 때마다 "대출 없이"로 초기화한다 — 이전에 어떤 걸 보고 있었는지와 무관하게
// 항상 같은 기본값에서 시작해야 매번 같은 흐름으로 확인할 수 있다.
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) selectedPlan.value = LOAN_X
  },
)

const hasLoanOption = computed(() => props.recommendation?.loanO != null)
const isLoanOActive = computed(() => hasLoanOption.value && selectedPlan.value === LOAN_O)

const activePlan = computed(() => {
  if (!props.recommendation) return null
  return isLoanOActive.value ? props.recommendation.loanO : props.recommendation.loanX
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
  emit('confirm', isLoanOActive.value ? LOAN_O : LOAN_X)
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

      <!-- loanO가 없는 recommendation(대출 활용 플랜 자체가 없음)은 탭을 보여주지 않고
           loanX 저장값만 그대로 보여준다. -->
      <div v-if="hasLoanOption" class="goal-confirm-modal__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          class="goal-confirm-modal__tab"
          :class="{ 'goal-confirm-modal__tab--active': !isLoanOActive }"
          :aria-selected="!isLoanOActive"
          @click="selectPlan('loanX')"
        >
          대출 없이
        </button>
        <button
          type="button"
          role="tab"
          class="goal-confirm-modal__tab"
          :class="{ 'goal-confirm-modal__tab--active': isLoanOActive }"
          :aria-selected="isLoanOActive"
          @click="selectPlan('loanO')"
        >
          대출 활용
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
      <div v-if="isLoanOActive" class="goal-confirm-modal__row">
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
/*
  BaseModal이 Teleport로 body에 렌더링돼 조상 기반 :deep()이 안 먹으므로, BaseModal 루트에
  직접 클래스를 붙여 plain scoped 선택자로 폭만 살짝 넓힌다(다른 modal 화면과 같은 패턴).
  세그먼트 탭 + 여러 행이 들어가 기본 320px보다 조금 더 넉넉해야 한 줄에 잘 들어간다.
*/
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

/*
  비교 화면의 "자산 비교 | 목표 비교" 세그먼트(CompareTabs.vue)와 같은 구조·수치를
  그대로 재사용한다. 그 컴포넌트는 CompareView 전용 로컬 톤(--c-*)에 묶여 있어 이 화면
  에서는 같은 값으로 귀결되는 전역 테마 토큰으로 다시 매핑한다.
*/
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
  /* BaseButton lg 기본 높이(51px)보다 살짝 낮춰, 팝업 안에서 다른 행들과 비교해 버튼이
     지나치게 커 보이지 않게 한다 — Compact 톤(46px)과 같은 값. */
  height: 46px;
  flex: 1;
}
</style>
