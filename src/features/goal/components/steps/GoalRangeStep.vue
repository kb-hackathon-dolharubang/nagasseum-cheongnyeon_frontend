<script setup>
import { computed } from 'vue'

import BaseDualRangeSlider from '@/shared/components/atoms/form/RangeSlider/BaseDualRangeSlider.vue'

const props = defineProps({
  modelValue: { type: Object, required: true }, // { min, max }
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  step: { type: Number, default: 1 },
  formatValue: { type: Function, default: (value) => value },
})

const emit = defineEmits(['update:modelValue'])

const rangeLabel = computed(
  () => `${props.formatValue(props.modelValue.min)} ~ ${props.formatValue(props.modelValue.max)}`,
)
</script>

<template>
  <div class="goal-range-step">
    <!--
      슬라이더 자체에도 값이 붙어 있지만 글씨가 작다. 화면에 질문이 하나뿐인 단계라
      지금 고른 범위를 크게 한 번 더 보여줘서, 슬라이더를 안 건드려도 무엇으로 넘어가는지 알 수 있게 한다.
    -->
    <p class="goal-range-step__value">{{ rangeLabel }}</p>

    <BaseDualRangeSlider
      :model-value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :format-value="formatValue"
      @update:model-value="emit('update:modelValue', $event)"
    />

    <div class="goal-range-step__scale">
      <span>{{ formatValue(min) }}</span>
      <span>{{ formatValue(max) }}</span>
    </div>
  </div>
</template>

<style scoped>
.goal-range-step {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.goal-range-step__value {
  margin: 0 0 12px;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.8px;
  color: var(--color-heading-accent, #e3ffe8);
}

.goal-range-step__scale {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--color-text-tertiary, #6f766d);
}
</style>
