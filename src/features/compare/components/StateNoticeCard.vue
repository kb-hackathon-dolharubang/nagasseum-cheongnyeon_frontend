<script setup>
defineProps({
  eyebrow: { type: String, required: true },
  variant: { type: String, default: 'default' }, // 'default' | 'wait'
  title: { type: String, required: true },
})
</script>

<template>
  <div class="state-card">
    <span class="state-card__eyebrow" :class="{ 'state-card__eyebrow--wait': variant === 'wait' }">
      {{ eyebrow }}
    </span>
    <p class="state-card__title">{{ title }}</p>
    <div class="state-card__body"><slot /></div>
    <div v-if="$slots.action" class="state-card__action"><slot name="action" /></div>
  </div>
</template>

<style scoped>
.state-card {
  border-radius: 14px;
  background: var(--c-card);
  border: 1px solid var(--c-line);
  padding: 16px;
  animation: card-rise 0.35s ease-out both;
  animation-delay: 0.18s;
}

.state-card__eyebrow {
  display: inline-flex;
  padding: 3px 9px;
  border-radius: 999px;
  background: var(--c-danger-soft);
  color: var(--c-danger);
  font-size: 10px;
  font-weight: 600;
  margin-bottom: 9px;
}

.state-card__eyebrow--wait {
  background: var(--c-warn-bg);
  color: var(--c-warn);
}

.state-card__title {
  margin: 0 0 5px;
  font-size: 15px;
  font-weight: 700;
  color: var(--c-ink);
}

.state-card__body {
  margin: 0;
  font-size: 11.5px;
  line-height: 1.6;
  color: var(--c-ink-muted);
}

.state-card__action {
  margin-top: 12px;
}
</style>
