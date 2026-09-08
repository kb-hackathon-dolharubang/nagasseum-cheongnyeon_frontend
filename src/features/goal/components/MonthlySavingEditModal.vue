<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'
import BaseChipGroup from '@/shared/components/atoms/form/ChipGroup/BaseChipGroup.vue'
import BaseInput from '@/shared/components/atoms/base/input/BaseInput.vue'
import { formatManwon, formatYearMonthKo } from '@/shared/utils/formatter'

import { useGoalStore } from '@/features/goal/store/goalStore'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  // goalStore.goalDetail 그대로 ({ progress, savingStatus, forecasts, ... })
  detail: { type: Object, required: true },
  isSubmitting: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const goalStore = useGoalStore()

const CUSTOM = 'CUSTOM'

// 추천 금액 = 상세 조회에서 내려온 실제 저축 기준(최근 3개월 평균 / 최근 저축액).
// 지금 계획 금액과 같은 값은 바꿀 이유가 없으므로 제외한다.
const recommendedAmounts = computed(() => {
  const fixed = props.detail.savingStatus.fixedSaving
  const amounts = props.detail.forecasts
    .filter((forecast) => forecast.basis !== 'FIXED')
    .map((forecast) => forecast.monthlySaving)
    .filter((amount) => typeof amount === 'number' && amount > 0 && amount !== fixed)

  return [...new Set(amounts)].sort((a, b) => a - b)
})

const options = computed(() => [
  ...recommendedAmounts.value.map((amount) => ({ value: amount, label: formatManwon(amount) })),
  { value: CUSTOM, label: '직접 입력' },
])

const selected = ref(null)
const customInput = ref('')

// 팝업을 다시 열 때마다 첫 추천 금액(없으면 직접 입력)으로 초기화한다.
watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) {
      goalStore.clearSavingSimulation()
      return
    }

    selected.value = recommendedAmounts.value[0] ?? CUSTOM
    customInput.value = ''
  },
  { immediate: true },
)

const customAmount = computed(() => Number(customInput.value.replace(/\D/g, '')) || 0)

const amount = computed(() => (selected.value === CUSTOM ? customAmount.value : selected.value))

function onCustomInput(value) {
  const digits = String(value).replace(/\D/g, '')
  customInput.value = digits ? Number(digits).toLocaleString('ko-KR') : ''
}

const fixedForecast = computed(
  () => props.detail.forecasts.find((forecast) => forecast.basis === 'FIXED') ?? null,
)

const isCustom = computed(() => selected.value === CUSTOM)

// 금액이 바뀌면 이전 시뮬레이션 결과는 더 이상 그 금액의 결과가 아니므로 지운다.
// (다시 보려면 [시뮬레이션 돌리기]를 눌러야 한다)
watch(amount, () => {
  goalStore.clearSavingSimulation()
})

onBeforeUnmount(() => {
  goalStore.clearSavingSimulation()
})

function runSimulation() {
  goalStore.loadSavingSimulation(props.detail.goalId, amount.value)
}

// 추천 금액 = 상세 조회 forecasts, 직접 입력 = 시뮬레이션 API 응답. 필드 구조가 같아 그대로 쓴다.
const forecast = computed(() => {
  if (!amount.value) return null
  if (isCustom.value) return goalStore.savingSimulation

  return props.detail.forecasts.find((item) => item.monthlySaving === amount.value) ?? null
})

const preview = computed(() => {
  if (!forecast.value || !fixedForecast.value?.expectedDate) return null

  return {
    amount: forecast.value.monthlySaving,
    currentDate: formatYearMonthKo(fixedForecast.value.expectedDate),
    // 남은 금액이 0이면 expectedDate가 null로 온다(이미 달성)
    expectedDate: forecast.value.expectedDate
      ? formatYearMonthKo(forecast.value.expectedDate)
      : null,
    monthsDiff: forecast.value.monthsDiff,
  }
})

const canSubmit = computed(() => amount.value > 0 && !props.isSubmitting)

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <Transition name="saving-edit-sheet">
    <div v-if="modelValue" class="saving-edit-sheet-layer">
      <div class="saving-edit-sheet-layer__backdrop" @click="close"></div>

      <section
        class="saving-edit-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="saving-edit-title"
      >
        <div class="saving-edit-sheet__handle" aria-hidden="true"></div>

        <div class="saving-edit-sheet__scroll">
          <h2 id="saving-edit-title" class="saving-edit-sheet__title">월 저축 계획 수정</h2>

          <div class="saving-edit-sheet__field">
            <span class="saving-edit-sheet__field-label">현재 월 저축 계획</span>
            <strong class="saving-edit-sheet__field-value">
              {{ formatManwon(detail.savingStatus.fixedSaving) }}
            </strong>
          </div>

          <p class="saving-edit-sheet__section-label">추천 금액</p>
          <BaseChipGroup
            v-model="selected"
            class="saving-edit-sheet__chips"
            :options="options"
            size="sm"
          />

          <div v-if="selected === CUSTOM" class="saving-edit-sheet__custom">
            <BaseInput
              class="saving-edit-sheet__custom-input"
              :model-value="customInput"
              type="text"
              inputmode="numeric"
              placeholder="금액을 입력하세요"
              @update:model-value="onCustomInput"
            />
            <span class="saving-edit-sheet__custom-unit">원</span>
          </div>

          <div v-if="preview || isCustom" class="saving-edit-sheet__preview">
            <p class="saving-edit-sheet__preview-title">변경하면 이렇게 달라져요</p>

            <template v-if="preview">
              <p class="saving-edit-sheet__preview-line">
                월 <strong>{{ formatManwon(preview.amount) }}</strong
                >으로 변경하면
              </p>
              <template v-if="preview.expectedDate">
                <p class="saving-edit-sheet__preview-transition">
                  {{ preview.currentDate }} → {{ preview.expectedDate }}
                </p>
                <p class="saving-edit-sheet__preview-result">
                  <template v-if="preview.monthsDiff > 0">
                    {{ preview.monthsDiff }}개월 앞당겨져요
                  </template>
                  <template v-else-if="preview.monthsDiff < 0">
                    {{ -preview.monthsDiff }}개월 늦어져요
                  </template>
                  <template v-else-if="preview.monthsDiff === 0"> 그대로예요 </template>
                  <template v-else> 달성할 것으로 예상돼요 </template>
                </p>
              </template>
              <p v-else class="saving-edit-sheet__preview-result">이미 목표 금액을 모았어요.</p>
            </template>

            <p v-else-if="goalStore.simulationError" class="saving-edit-sheet__preview-placeholder">
              예상 달성일을 계산하지 못했어요.
            </p>
            <p v-else class="saving-edit-sheet__preview-placeholder">
              금액을 입력하고 예상 달성일을 확인해보세요.
            </p>

            <!-- 직접 입력한 금액은 이 버튼을 눌렀을 때만 서버에 계산을 요청한다.
                 결과가 나오면 버튼은 감추고, 금액을 바꾸면 결과가 지워지면서 다시 나타난다 -->
            <div v-if="isCustom && !preview" class="saving-edit-sheet__simulate">
              <BaseButton
                class="saving-edit-sheet__simulate-button"
                variant="primary"
                size="md"
                :disabled="!amount || goalStore.isSimulating"
                @click="runSimulation"
              >
                {{ goalStore.isSimulating ? '계산 중...' : '시뮬레이션 돌리기' }}
              </BaseButton>
            </div>
          </div>

          <p class="saving-edit-sheet__hint">
            목표 달성 계산에 반영되는 계획 금액이며,<br />실제 자동이체 금액은 변경되지 않아요.
          </p>
        </div>

        <div class="saving-edit-sheet__actions">
          <BaseButton variant="secondary" @click="close">취소</BaseButton>
          <BaseButton variant="primary" :disabled="!canSubmit" @click="emit('submit', amount)">
            적용하기
          </BaseButton>
        </div>
      </section>
    </div>
  </Transition>
</template>

<style scoped>
/*
  `비교 기준 수정`(CohortEditSheet)의 Bottom Sheet 구조/수치를 그대로 재사용한다.
  두 수정 화면이 같은 패턴으로 보이도록 레이어·시트·핸들·타이틀·Footer 값을 맞췄다.
*/
.saving-edit-sheet-layer {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.saving-edit-sheet-layer__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
}

.saving-edit-sheet-enter-active,
.saving-edit-sheet-leave-active {
  transition: opacity 0.22s ease;
}

.saving-edit-sheet-enter-active .saving-edit-sheet,
.saving-edit-sheet-leave-active .saving-edit-sheet {
  transition: transform 0.22s cubic-bezier(0.32, 0.72, 0, 1);
}

.saving-edit-sheet-enter-from,
.saving-edit-sheet-leave-to {
  opacity: 0;
}

.saving-edit-sheet-enter-from .saving-edit-sheet,
.saving-edit-sheet-leave-to .saving-edit-sheet {
  transform: translateY(100%);
}

.saving-edit-sheet {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px;
  max-height: min(85dvh, 640px);
  padding: 10px 16px calc(16px + env(safe-area-inset-bottom, 0px));
  border-radius: 24px 24px 0 0;
  background: var(--color-surface, #ffffff);
  color: var(--color-text-primary, #10130f);
  line-height: 1.45;
  box-shadow: 0 -12px 32px rgba(16, 19, 15, 0.12);
}

.saving-edit-sheet__handle {
  flex: none;
  width: 36px;
  height: 4px;
  margin: 0 auto 14px;
  border-radius: 999px;
  background: var(--color-border, #e3e7e0);
}

.saving-edit-sheet__scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.saving-edit-sheet__title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary, #10130f);
  text-align: left;
}

.saving-edit-sheet__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px;
  border-radius: 14px;
  background: var(--color-app-bg, #f7f8f4);
}

.saving-edit-sheet__field-label {
  color: var(--color-text-tertiary, #8f968c);
  font-size: 11px;
}

.saving-edit-sheet__field-value {
  color: var(--color-primary, #1d6b3f);
  font-size: 16px;
  font-weight: 700;
}

.saving-edit-sheet__section-label {
  margin: 14px 0 8px;
  color: var(--color-text-tertiary, #8f968c);
  font-size: 13px;
}

.saving-edit-sheet__custom {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  margin-top: 10px;
  border-radius: 14px;
  background: var(--color-app-bg, #f7f8f4);
}

/* 시트가 body로 Teleport되지 않는 일반 자식 구조라 :deep()이 바로 닿는다 */
.saving-edit-sheet :deep(.saving-edit-sheet__custom-input) {
  border: none;
  background: transparent;
  color: var(--color-text-primary, #10130f);
  font-size: 14px;
  padding: 14px 0;
}

.saving-edit-sheet :deep(.saving-edit-sheet__custom-input):focus {
  outline: none;
}

.saving-edit-sheet__custom-unit {
  flex-shrink: 0;
  color: var(--color-text-tertiary, #8f968c);
  font-size: 13px;
}

.saving-edit-sheet__preview {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px;
  margin-top: 12px;
  border-radius: 14px;
  background: var(--color-app-bg, #f7f8f4);
}

.saving-edit-sheet__preview-title {
  margin: 0 0 4px;
  color: var(--color-text-tertiary, #8f968c);
  font-size: 12px;
  font-weight: 700;
}

.saving-edit-sheet__preview-line {
  margin: 0;
  color: var(--color-text-primary, #10130f);
  font-size: 13px;
}

.saving-edit-sheet__preview-transition {
  margin: 2px 0 0;
  color: var(--color-text-secondary, #5b6358);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.saving-edit-sheet__preview-result {
  margin: 2px 0 0;
  color: var(--color-primary, #1d6b3f);
  font-size: 14px;
  font-weight: 700;
}

.saving-edit-sheet__preview-placeholder {
  margin: 0;
  color: var(--color-text-tertiary, #8f968c);
  font-size: 12px;
}

.saving-edit-sheet__simulate {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

/* 폭이 좁은 인라인 유틸 버튼이라 md(15px)보다도 작게 두되, 임의의 12px 대신
   프로젝트 버튼 타이포 기준의 최소 단위인 text 액션 크기(13px)에 맞춘다 */
.saving-edit-sheet__simulate-button {
  width: auto;
  height: 34px;
  padding: 0 16px;
  border-radius: 10px;
  font-size: 13px;
}

.saving-edit-sheet__hint {
  margin: 16px 0 0;
  text-align: center;
  font-size: 11px;
  line-height: 1.5;
  color: var(--color-text-tertiary, #8f968c);
}

.saving-edit-sheet__actions {
  flex: none;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--color-border, #e3e7e0);
}

/*
  `비교 기준 수정`의 Footer 버튼 색과 동일하게 맞춘다. BaseButton은 공용 컴포넌트라
  손대지 않고 이 시트 안에서만 덮어쓴다 — 적용하기는 진한 primary green(--color-primary),
  취소는 옅은 배경의 secondary 그대로 둔다.
*/
.saving-edit-sheet__actions :deep(.base-button--secondary) {
  border: 1px solid var(--color-border, #e3e7e0);
  background: var(--color-app-bg, #f7f8f4);
  color: var(--color-text-primary, #10130f);
}

.saving-edit-sheet__actions :deep(.base-button--primary) {
  background: var(--color-primary, #1d6b3f);
  color: #ffffff;
}

/* 칩(핀)에도 시트 톤에 맞춰 테두리를 없앤다. 선택 안 된 칩은 field 배경과 구분되게 흰 배경 유지 */
.saving-edit-sheet :deep(.saving-edit-sheet__chips) .chip-group__item {
  border: none;
  background: var(--color-surface, #ffffff);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.saving-edit-sheet :deep(.saving-edit-sheet__chips) .chip-group__item--active {
  background: var(--color-primary, #1d6b3f);
  color: #ffffff;
}
</style>
