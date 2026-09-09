<script setup>
defineProps({
  // [{ policyId, productName, eligible }] — 목표 상세화면의 "대출 활용" 시나리오 목록.
  options: { type: Array, required: true },
  modelValue: { type: Number, required: true },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="loan-scenario-toggle" role="tablist">
    <button
      v-for="(option, index) in options"
      :key="option.policyId"
      type="button"
      role="tab"
      class="loan-scenario-toggle__pill"
      :class="{
        'loan-scenario-toggle__pill--active': index === modelValue,
        'loan-scenario-toggle__pill--ineligible': option.eligible === false,
      }"
      :aria-selected="index === modelValue"
      @click="$emit('update:modelValue', index)"
    >
      {{ option.productName }}
    </button>
  </div>
</template>

<style scoped>
.loan-scenario-toggle {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.loan-scenario-toggle__pill {
  flex: none;
  border: 1px solid var(--color-border, #262626);
  border-radius: 999px;
  padding: 8px 14px;
  background: var(--color-surface, #161616);
  color: var(--color-text-primary, #ffffff);
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
}

.loan-scenario-toggle__pill--active {
  border-color: var(--color-primary, #1d6b3f);
  background: var(--color-primary-soft, #e8f4ea);
  color: var(--color-primary, #1d6b3f);
}

.loan-scenario-toggle__pill--ineligible {
  opacity: 0.55;
}
</style>
