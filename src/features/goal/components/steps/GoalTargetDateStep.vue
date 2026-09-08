<script setup>
import { computed } from 'vue'

import BaseYearMonthSelect from '@/shared/components/atoms/form/YearMonthSelect/BaseYearMonthSelect.vue'
import { formatYearMonth } from '@/shared/utils/formatter'

const props = defineProps({
  modelValue: { type: String, default: '' }, // 'YYYY-MM'
})

const emit = defineEmits(['update:modelValue'])

const QUICK_PICKS = [
  { label: '1년 뒤', months: 12 },
  { label: '2년 뒤', months: 24 },
  { label: '3년 뒤', months: 36 },
  { label: '5년 뒤', months: 60 },
]

function addMonths(months) {
  const now = new Date()
  const total = now.getFullYear() * 12 + now.getMonth() + months
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`
}

const quickOptions = computed(() =>
  QUICK_PICKS.map((pick) => ({ ...pick, value: addMonths(pick.months) })),
)

// 지금부터 목표 시점까지 몇 달 남았는지. 저축 기간이 얼마나 되는지 감을 주기 위한 보조 문구다.
const monthsFromNow = computed(() => {
  if (!props.modelValue) return null
  const [year, month] = props.modelValue.split('-').map(Number)
  const now = new Date()
  return year * 12 + (month - 1) - (now.getFullYear() * 12 + now.getMonth())
})
</script>

<template>
  <div class="goal-target-date-step">
    <div class="goal-target-date-step__chips">
      <button
        v-for="option in quickOptions"
        :key="option.label"
        type="button"
        class="goal-target-date-step__chip"
        :class="{ 'goal-target-date-step__chip--active': option.value === modelValue }"
        @click="emit('update:modelValue', option.value)"
      >
        {{ option.label }}
      </button>
    </div>

    <BaseYearMonthSelect
      :model-value="modelValue"
      @update:model-value="emit('update:modelValue', $event)"
    />

    <p v-if="modelValue" class="goal-target-date-step__summary">
      <span class="goal-target-date-step__summary-name">{{ formatYearMonth(modelValue) }}</span>
      <span v-if="monthsFromNow > 0" class="goal-target-date-step__summary-sub">
        지금부터 {{ monthsFromNow }}개월
      </span>
    </p>
  </div>
</template>

<style scoped>
.goal-target-date-step {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.goal-target-date-step__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.goal-target-date-step__chip {
  padding: 8px 16px;
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

.goal-target-date-step__chip--active {
  border-color: transparent;
  background: var(--base-button-primary-bg, #e3ffe8);
  color: var(--base-button-primary-text, #16281c);
  font-weight: 700;
}

.goal-target-date-step__summary {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 0;
  padding-top: 16px;
  border-top: 1px solid var(--color-border, #262626);
}

.goal-target-date-step__summary-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-heading-accent, #e3ffe8);
}

.goal-target-date-step__summary-sub {
  font-size: 12.5px;
  color: var(--color-text-tertiary, #6f766d);
}
</style>
