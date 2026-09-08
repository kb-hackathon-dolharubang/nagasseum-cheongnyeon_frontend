<script setup>
defineProps({
  variant: { type: String, default: 'neutral' },
})
</script>

<template>
  <span class="base-badge" :class="`base-badge--${variant}`">
    <slot />
  </span>
</template>

<style scoped>
.base-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 20px;
  padding: 0 8px;
  border-radius: 10px;
  border: 1px solid transparent;
  font-size: 12px;
  line-height: 1;
  white-space: nowrap;
}

.base-badge--point {
  background: rgba(193, 68, 46, 0.15);
  color: var(--color-point, #c1442e);
}

.base-badge--mint {
  background: var(--base-badge-mint-bg, #c1e8c8);
  color: var(--base-badge-mint-text, #16281c);
}

.base-badge--neutral {
  background: var(--color-border, #666666);
  color: var(--color-text-secondary, #ebebeb);
}

.base-badge--outline {
  background: transparent;
  border-color: var(--color-border, #262626);
  color: var(--color-text-secondary, #9aa09a);
}

.base-badge--quest {
  background: transparent;
  border-color: #d4a857;
  color: #d4a857;
}
</style>
