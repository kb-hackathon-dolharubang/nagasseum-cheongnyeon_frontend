<script setup>
import BaseBadge from '@/shared/components/atoms/base/badge/BaseBadge.vue'

defineProps({
  loans: { type: Array, required: true },
  modelValue: { type: Number, required: true },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="recommendation-loan-tabs" role="tablist">
    <button
      v-for="(loan, index) in loans"
      :key="loan.policyId"
      type="button"
      role="tab"
      class="recommendation-loan-tabs__row"
      :class="{ 'recommendation-loan-tabs__row--active': index === modelValue }"
      :aria-selected="index === modelValue"
      @click="$emit('update:modelValue', index)"
    >
      <span class="recommendation-loan-tabs__name">{{ loan.productName }}</span>
      <BaseBadge :variant="loan.statusVariant">{{ loan.statusLabel }}</BaseBadge>
    </button>
  </div>
</template>

<style scoped>
.recommendation-loan-tabs {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recommendation-loan-tabs__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  border: 1px solid var(--color-border, #262626);
  border-radius: 12px;
  padding: 12px 14px;
  background: var(--color-surface, #161616);
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}

.recommendation-loan-tabs__row--active {
  border-color: var(--color-primary, #1d6b3f);
  background: var(--color-primary-soft, #e8f4ea);
}

.recommendation-loan-tabs__name {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.recommendation-loan-tabs__row--active .recommendation-loan-tabs__name {
  color: var(--color-primary, #1d6b3f);
}
</style>
