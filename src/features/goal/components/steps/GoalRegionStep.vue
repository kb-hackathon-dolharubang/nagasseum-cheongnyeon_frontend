<script setup>
import { computed, ref } from 'vue'

import { SIDO_LIST, GUGUN_BY_SIDO } from '@/shared/constants/regions'
import { DONG_BY_SIGUNGU } from '@/shared/constants/regionDongs'

const props = defineProps({
  // 시군구 5자리(예: '11440') 또는 시도 2자리(예: '11'). 미선택이면 null.
  modelValue: { type: String, default: null },
  // 읍면동 10자리(예: '1144010100'). 동을 고르지 않으면 null.
  dongCode: { type: String, default: null },
})

const emit = defineEmits(['update:modelValue', 'update:dongCode'])

/** 이미 고른 코드가 있으면(뒤로 왔을 때) 그 코드가 속한 시·도를 펼쳐둔다. */
function resolveInitialSido(code) {
  if (!code) return null
  if (code.length === 2) return code
  return SIDO_LIST.find((sido) => code.startsWith(sido.code))?.code ?? null
}

const selectedSido = ref(resolveInitialSido(props.modelValue))

const gugunOptions = computed(() =>
  selectedSido.value ? (GUGUN_BY_SIDO[selectedSido.value] ?? []) : [],
)

// 구·군(5자리)이 선택된 상태일 때만 동 목록을 보여준다.
const selectedGugunCode = computed(() => {
  const v = props.modelValue
  return v && v.length === 5 ? v : null
})

const dongOptions = computed(() =>
  selectedGugunCode.value ? (DONG_BY_SIGUNGU[selectedGugunCode.value] ?? []) : [],
)

const selectedSidoName = computed(
  () => SIDO_LIST.find((sido) => sido.code === selectedSido.value)?.name ?? '',
)

const selectedGugunName = computed(
  () => gugunOptions.value.find((gugun) => gugun.code === props.modelValue)?.name ?? '',
)

const selectedDongName = computed(
  () => dongOptions.value.find((dong) => dong.code === props.dongCode)?.dongName ?? '',
)

// 시·도만 고른 상태. 백엔드는 2자리 코드를 받으면 그 시·도 안에서 알고리즘이 시군구를 판단한다.
const isSidoOnly = computed(() => props.modelValue === selectedSido.value)

function selectSido(code) {
  selectedSido.value = code
  emit('update:modelValue', code)
  emit('update:dongCode', null)
}

function selectGugun(code) {
  emit('update:modelValue', code)
  emit('update:dongCode', null)
}

function selectDong(code) {
  emit('update:dongCode', code)
}
</script>

<template>
  <div class="goal-region-step">
    <div class="goal-region-step__field">
      <p class="goal-region-step__label">시 · 도</p>
      <div class="goal-region-step__chips">
        <button
          v-for="sido in SIDO_LIST"
          :key="sido.code"
          type="button"
          class="goal-region-step__chip"
          :class="{ 'goal-region-step__chip--active': sido.code === selectedSido }"
          @click="selectSido(sido.code)"
        >
          {{ sido.name }}
        </button>
      </div>
    </div>

    <div v-if="selectedSido" class="goal-region-step__field">
      <p class="goal-region-step__label">
        구 · 군 <span class="goal-region-step__optional">선택</span>
      </p>

      <div v-if="gugunOptions.length" class="goal-region-step__chips">
        <button
          type="button"
          class="goal-region-step__chip"
          :class="{ 'goal-region-step__chip--active': isSidoOnly }"
          @click="selectSido(selectedSido)"
        >
          {{ selectedSidoName }} 전체
        </button>
        <button
          v-for="gugun in gugunOptions"
          :key="gugun.code"
          type="button"
          class="goal-region-step__chip"
          :class="{ 'goal-region-step__chip--active': gugun.code === modelValue }"
          @click="selectGugun(gugun.code)"
        >
          {{ gugun.name }}
        </button>
      </div>

      <!-- regions.js가 서울 외 시·도는 구·군을 일부만 채워둬서, 아예 비어 있는 시·도가 있다. -->
      <p v-else class="goal-region-step__empty">
        아직 구·군 목록이 준비되지 않은 지역이에요. {{ selectedSidoName }} 전체로 찾아드릴게요.
      </p>
    </div>

    <div v-if="selectedGugunCode && dongOptions.length" class="goal-region-step__field">
      <p class="goal-region-step__label">
        읍 · 면 · 동 <span class="goal-region-step__optional">선택</span>
      </p>
      <div class="goal-region-step__chips">
        <button
          type="button"
          class="goal-region-step__chip"
          :class="{ 'goal-region-step__chip--active': !dongCode }"
          @click="selectDong(null)"
        >
          {{ selectedGugunName }} 전체
        </button>
        <button
          v-for="dong in dongOptions"
          :key="dong.code"
          type="button"
          class="goal-region-step__chip"
          :class="{ 'goal-region-step__chip--active': dong.code === dongCode }"
          @click="selectDong(dong.code)"
        >
          {{ dong.dongName }}
        </button>
      </div>
    </div>

    <p v-if="modelValue" class="goal-region-step__summary">
      <span class="goal-region-step__summary-name">
        {{ selectedSidoName }}{{ selectedGugunName ? ` ${selectedGugunName}` : ' 전체'
        }}{{ selectedDongName ? ` ${selectedDongName}` : '' }}
      </span>
      <span class="goal-region-step__summary-code">{{ dongCode ?? modelValue }}</span>
    </p>
  </div>
</template>

<style scoped>
.goal-region-step {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.goal-region-step__field {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.goal-region-step__label {
  margin: 0;
  font-size: 13.2px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.goal-region-step__optional {
  margin-left: 4px;
  font-weight: 400;
  color: var(--color-text-tertiary, #6f766d);
}

.goal-region-step__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.goal-region-step__chip {
  padding: 8px 14px;
  border: 1px solid var(--color-border, #262626);
  border-radius: 999px;
  background: var(--color-surface, #161616);
  color: var(--color-text-secondary, #9aa09a);
  font: inherit;
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.18s ease,
    color 0.18s ease,
    border-color 0.18s ease;
}

.goal-region-step__chip--active {
  border-color: transparent;
  background: var(--base-button-primary-bg, #e3ffe8);
  color: var(--base-button-primary-text, #16281c);
  font-weight: 700;
}

.goal-region-step__empty {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--color-text-tertiary, #6f766d);
}

.goal-region-step__summary {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 0;
  padding-top: 16px;
  border-top: 1px solid var(--color-border, #262626);
}

.goal-region-step__summary-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-heading-accent, #e3ffe8);
}

.goal-region-step__summary-code {
  font-size: 12px;
  color: var(--color-text-tertiary, #6f766d);
}
</style>
