<script setup>
defineProps({
  type: { type: String, default: 'button' },
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'lg' },
  disabled: { type: Boolean, default: false },
})

defineEmits(['click'])
</script>

<template>
  <button
    :type="type"
    class="base-button"
    :class="[`base-button--${variant}`, `base-button--${size}`]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<style scoped>
.base-button {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  font-family: inherit;
  cursor: pointer;
}

.base-button--lg {
  width: 100%;
  height: 51px;
  padding: 0 20px;
  border-radius: 17px;
  font-size: 16px;
  font-weight: 700;
}

.base-button--md {
  width: auto;
  height: 46px;
  padding: 0 16px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
}

.base-button--primary {
  background: var(--base-button-primary-bg, #e3ffe8);
  color: var(--base-button-primary-text, #16281c);
}

.base-button--secondary {
  background: var(--color-surface, #2a2a2a);
  color: var(--color-text-primary, #e3ffe8);
}

.base-button--highlight {
  background: var(--color-text-primary, #f7ffd1);
  color: var(--color-app-bg, #111111);
}

.base-button--dark {
  background: var(--color-mint-deep, #16281c);
  color: var(--color-card-highlight, #f7ffd1);
}

.base-button--text {
  width: auto;
  height: auto;
  padding: 4px;
  border-radius: 0;
  background: none;
  color: var(--color-text-tertiary, #8f968c);
  font-size: 13px;
  font-weight: 700;
  gap: 2px;
}

.base-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
