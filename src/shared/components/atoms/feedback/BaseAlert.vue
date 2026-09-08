<script setup>
defineProps({
  variant: { type: String, default: 'info' },
})
</script>

<template>
  <div class="alert" :class="`alert--${variant}`">
    <slot />
  </div>
</template>

<style scoped>
.alert {
  padding: 12px 16px;
  border: 1px solid transparent;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
}

.alert--info {
  background: var(--accent-bg, rgba(227, 255, 232, 0.1));
  border-color: var(--accent-border, rgba(227, 255, 232, 0.5));
  color: var(--accent, #e3ffe8);
}

.alert--success {
  background: rgba(193, 232, 200, 0.12);
  border-color: var(--color-mint-strong, #c1e8c8);
  color: var(--color-mint-strong, #c1e8c8);
}

.alert--error {
  background: rgba(193, 68, 46, 0.12);
  border-color: var(--color-point, #c1442e);
  color: var(--color-point, #c1442e);
}
</style>
