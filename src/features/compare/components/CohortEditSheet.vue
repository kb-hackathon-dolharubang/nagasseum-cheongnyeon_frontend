<script setup>
import { computed, ref } from 'vue'

import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'

import { filterEligibleCohortTypes } from '@/features/compare/composables/useCohortFilter'

import runnerImage from '@/features/compare/assets/runner.png'

const ASSET = { min: 5_000_000, max: 30_000_000, step: 1_000_000 }
const AGE = { min: 1, max: 5, step: 1 }

const props = defineProps({
  assetRange: { type: Number, required: true },
  ageRange: { type: Number, required: true },
  cohortTypes: { type: Array, default: () => [] },
  hasIncomeInfo: { type: Boolean, default: true },
  hasOccupationInfo: { type: Boolean, default: true },
})

const emit = defineEmits(['apply', 'close'])

const draftAsset = ref(props.assetRange)
const draftAge = ref(props.ageRange)
const draftTypes = ref(
  filterEligibleCohortTypes(props.cohortTypes, {
    hasIncomeInfo: props.hasIncomeInfo,
    hasOccupationInfo: props.hasOccupationInfo,
  }),
)

const openTooltip = ref(null) // null | 'INCOME' | 'OCCUPATION'

function toggleTooltip(key) {
  openTooltip.value = openTooltip.value === key ? null : key
}

const manwon = (won) => (won / 10000).toLocaleString()

const percent = (value, { min, max }) => `${((value - min) / (max - min)) * 100}%`

const assetPct = computed(() => percent(draftAsset.value, ASSET))
const agePct = computed(() => percent(draftAge.value, AGE))

function apply() {
  emit('apply', {
    assetRange: draftAsset.value,
    ageRange: draftAge.value,
    cohortTypes: draftTypes.value,
  })
}
</script>

<template>
  <div class="sheet-layer">
    <div class="sheet-layer__backdrop" @click="emit('close')"></div>

    <section
      class="sheet"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cohort-edit-title"
      :style="{ '--thumb': `url(${runnerImage})` }"
    >
      <div class="sheet__handle" aria-hidden="true"></div>

      <div class="sheet__scroll" @click="openTooltip = null">
        <h2 id="cohort-edit-title" class="sheet__title">비교 기준 수정</h2>

        <div class="field">
          <div class="field__head">
            <span>자산 범위</span>
            <b>±{{ manwon(draftAsset) }}만원</b>
          </div>
          <div class="slider" :style="{ '--pct': assetPct }">
            <div class="slider__track"></div>
            <input
              v-model.number="draftAsset"
              class="slider__input"
              type="range"
              :min="ASSET.min"
              :max="ASSET.max"
              :step="ASSET.step"
              aria-label="자산 범위"
            />
          </div>
          <div class="field__scale">
            <span>{{ manwon(ASSET.min) }}만</span>
            <span>{{ manwon(ASSET.max) }}만</span>
          </div>
        </div>

        <div class="field">
          <div class="field__head">
            <span>나이 범위</span>
            <b>±{{ draftAge }}세</b>
          </div>
          <div class="slider" :style="{ '--pct': agePct }">
            <div class="slider__track"></div>
            <input
              v-model.number="draftAge"
              class="slider__input"
              type="range"
              :min="AGE.min"
              :max="AGE.max"
              :step="AGE.step"
              aria-label="나이 범위"
            />
          </div>
          <div class="field__scale">
            <span>{{ AGE.min }}세</span>
            <span>{{ AGE.max }}세</span>
          </div>
        </div>

        <div class="field">
          <div class="field__head">
            <span>추가 조건</span>
          </div>
          <div class="checkbox-group">
            <div class="checkbox-wrap">
              <label class="checkbox" :class="{ 'checkbox--disabled': !hasIncomeInfo }">
                <input
                  v-model="draftTypes"
                  type="checkbox"
                  value="INCOME"
                  :disabled="!hasIncomeInfo"
                />
                소득 구간
                <button
                  v-if="!hasIncomeInfo"
                  type="button"
                  class="checkbox__hint"
                  aria-label="소득 구간을 사용할 수 없는 이유"
                  @click.stop="toggleTooltip('INCOME')"
                >
                  ?
                </button>
              </label>
              <div v-if="openTooltip === 'INCOME'" class="tooltip" role="tooltip">
                마이페이지에서 소득 정보를 등록하면 사용할 수 있어요.
              </div>
            </div>

            <div class="checkbox-wrap">
              <label class="checkbox" :class="{ 'checkbox--disabled': !hasOccupationInfo }">
                <input
                  v-model="draftTypes"
                  type="checkbox"
                  value="OCCUPATION"
                  :disabled="!hasOccupationInfo"
                />
                직업군
                <button
                  v-if="!hasOccupationInfo"
                  type="button"
                  class="checkbox__hint"
                  aria-label="직업군을 사용할 수 없는 이유"
                  @click.stop="toggleTooltip('OCCUPATION')"
                >
                  ?
                </button>
              </label>
              <div v-if="openTooltip === 'OCCUPATION'" class="tooltip" role="tooltip">
                마이페이지에서 직업 정보를 등록하면 사용할 수 있어요.
              </div>
            </div>
          </div>
        </div>

        <p class="sheet__hint">
          범위를 넓히면 비교 대상이 늘어나지만<br />유사도는 낮아질 수 있어요.
        </p>
      </div>

      <div class="sheet__actions">
        <BaseButton variant="secondary" @click="emit('close')">취소</BaseButton>
        <BaseButton variant="primary" @click="apply">적용하기</BaseButton>
      </div>
    </section>
  </div>
</template>

<style scoped>
.sheet-layer {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.sheet-layer__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.22s ease;
}

.sheet-enter-active .sheet,
.sheet-leave-active .sheet {
  transition: transform 0.22s cubic-bezier(0.32, 0.72, 0, 1);
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .sheet,
.sheet-leave-to .sheet {
  transform: translateY(100%);
}

.sheet {
  --surface: var(--c-card);
  --ink: var(--c-ink);
  --ink-muted: var(--c-ink-muted);
  --track: var(--c-track);
  --track-fill: var(--c-accent);
  --dark: var(--c-tooltip-bg); /* 툴팁 전용 */
  --on-dark: rgba(255, 255, 255, 0.72);

  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px;
  max-height: min(85dvh, 640px);
  padding: 10px 16px calc(16px + env(safe-area-inset-bottom, 0px));
  border-radius: 24px 24px 0 0;
  background: var(--surface);
  color: var(--ink);
  line-height: 1.45;
  box-shadow: 0 -12px 32px rgba(16, 19, 15, 0.12);
}

.sheet__handle {
  flex: none;
  width: 36px;
  height: 4px;
  margin: 0 auto 14px;
  border-radius: 999px;
  background: var(--c-line);
}

.sheet__scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.sheet__title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
}

.field {
  padding: 14px;
  border-radius: 14px;
  background: var(--c-bg);
}

.field + .field {
  margin-top: 12px;
}

.field__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font-size: 13px;
}

.field__head b {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.field__scale {
  display: flex;
  justify-content: space-between;
  margin-top: 2px;
  font-size: 10px;
  color: var(--ink-muted);
}

.slider {
  --thumb-size: 24px;

  position: relative;
  height: var(--thumb-size);
  margin-top: 6px;
}

.slider__track {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 3px;
  transform: translateY(-50%);
  background: linear-gradient(to right, var(--track-fill) 0 var(--pct), var(--track) var(--pct));
}

.slider__input {
  -webkit-appearance: none;
  appearance: none;
  position: absolute;
  top: 0;
  left: calc(var(--thumb-size) / -2);
  width: calc(100% + var(--thumb-size));
  height: var(--thumb-size);
  margin: 0;
  background: transparent;
  cursor: pointer;
}

.slider__input::-webkit-slider-runnable-track {
  height: var(--thumb-size);
  background: transparent;
}

.slider__input::-moz-range-track {
  height: var(--thumb-size);
  background: transparent;
}

.slider__input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: var(--thumb-size);
  height: var(--thumb-size);
  border: 0;
  background: var(--thumb) center / contain no-repeat;
  image-rendering: pixelated;
}

.slider__input::-moz-range-thumb {
  width: var(--thumb-size);
  height: var(--thumb-size);
  border: 0;
  background: var(--thumb) center / contain no-repeat;
  image-rendering: pixelated;
}

.checkbox-group {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.checkbox-wrap {
  position: relative;
}

.checkbox {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border-radius: 999px;
  padding: 7px 12px;
  border: 1px solid var(--c-line);
  background: var(--c-bg);
  color: var(--c-ink);
  font-size: 12px;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.checkbox input {
  appearance: none;
  position: relative;
  flex: none;
  width: 15px;
  height: 15px;
  margin: 0;
  border: 1.5px solid var(--c-ink-faint);
  border-radius: 5px;
  cursor: pointer;
}

.checkbox input:checked {
  border-color: var(--track-fill);
  background: var(--track-fill);
}

.checkbox input:checked::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 1px;
  width: 4px;
  height: 8px;
  border: solid var(--c-on-accent);
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox--disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.checkbox--disabled input {
  cursor: not-allowed;
}

.checkbox__hint {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 13px;
  height: 13px;
  margin: 0;
  padding: 0;
  border: 1px solid var(--c-ink-faint);
  border-radius: 50%;
  background: none;
  color: inherit;
  font-size: 9px;
  line-height: 1;
  cursor: pointer;
}

.tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  z-index: 1;
  width: max-content;
  max-width: 200px;
  padding: 8px 10px;
  border-radius: 8px;
  background: var(--dark);
  color: #f0f2ef;
  font-size: 11px;
  line-height: 1.4;
  box-shadow: 0 4px 12px rgba(16, 19, 15, 0.18);
}

.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 14px;
  border: 5px solid transparent;
  border-top-color: var(--dark);
}

.sheet__hint {
  margin: 16px 0 0;
  text-align: center;
  font-size: 11px;
  line-height: 1.5;
  color: var(--c-ink-muted);
}

.sheet__actions {
  flex: none;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--c-line);
}

/*
  BaseButton은 공용 컴포넌트라 손대지 않고 이 시트 안에서만 색을 덮어쓴다.
  기본값(secondary #2a2a2a)이 밝은 시트 위에서 검은 덩어리로 보인다.
*/
.sheet__actions :deep(.base-button--secondary) {
  border: 1px solid var(--c-line);
  background: var(--c-bg);
  color: var(--c-ink);
}

.sheet__actions :deep(.base-button--primary) {
  background: var(--c-accent);
  color: var(--c-on-accent);
}
</style>
