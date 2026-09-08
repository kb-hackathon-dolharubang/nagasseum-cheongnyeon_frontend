<script setup>
defineProps({
  policy: { type: Object, required: true },
})

defineEmits(['click'])

function getDeadlineLabel(policy) {
  if (policy.applyPeriodType === '상시') return '상시 모집'
  if (!policy.applyEndDate) return ''
  return `~${policy.applyEndDate}`
}

function isDeadlineSoon(policy) {
  if (!policy.applyEndDate) return false
  const diff = (new Date(policy.applyEndDate) - Date.now()) / (1000 * 60 * 60 * 24)
  return diff >= 0 && diff <= 30
}
</script>

<template>
  <div class="policy-card" @click="$emit('click', policy)">
    <div class="policy-card__header">
      <span class="policy-card__category">{{ policy.largeCategory }}</span>
      <span v-if="isDeadlineSoon(policy)" class="policy-card__deadline-badge">마감 임박</span>
    </div>

    <p class="policy-card__name">{{ policy.policyName }}</p>
    <p class="policy-card__summary">{{ policy.policySummary }}</p>

    <div class="policy-card__footer">
      <span class="policy-card__benefit">{{ policy.benefitDescription }}</span>
      <span class="policy-card__deadline">{{ getDeadlineLabel(policy) }}</span>
    </div>
  </div>
</template>

<style scoped>
.policy-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  background: var(--color-surface, #161616);
  border: 1px solid var(--color-border, #262626);
  border-radius: 16px;
  cursor: pointer;
  transition: opacity 0.15s ease;
  animation: card-rise 0.35s ease-out both;
}

.policy-card:active {
  opacity: 0.75;
}

.policy-card__header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.policy-card__category {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 8px;
  background: var(--color-primary-soft, #e3ffe8);
  color: var(--color-primary, #1d6b3f);
  font-size: 11px;
  font-weight: 700;
  border-radius: 6px;
  font-family: var(--sans-normal);
}

.policy-card__deadline-badge {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 8px;
  background: rgba(193, 68, 46, 0.12);
  color: var(--color-point, #c1442e);
  font-size: 11px;
  font-weight: 700;
  border-radius: 6px;
  font-family: var(--sans-normal);
}

.policy-card__name {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
  line-height: 1.35;
  font-family: var(--sans-normal);
}

.policy-card__summary {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-secondary, #9aa09a);
  line-height: 1.5;
  font-family: var(--sans-normal);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.policy-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.policy-card__benefit {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
  font-family: var(--sans-normal);
}

.policy-card__deadline {
  font-size: 12px;
  color: var(--color-text-tertiary, #6f766d);
  font-family: var(--sans-normal);
}
</style>
