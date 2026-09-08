<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    class="base-toggle"
    :class="{ 'base-toggle--on': modelValue }"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span class="base-toggle__thumb" />
  </button>
</template>

<style scoped>
.base-toggle {
  position: relative;
  width: 50px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 14px;
  background: var(--color-border, #383e3a);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.base-toggle--on {
  background: var(--color-primary, #1d6b3f);
}

.base-toggle__thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  border-radius: 11px;
  background: #ffffff;
  transition:
    transform 0.15s ease,
    background-color 0.15s ease;
}

.base-toggle--on .base-toggle__thumb {
  transform: translateX(19px);
}
</style>
