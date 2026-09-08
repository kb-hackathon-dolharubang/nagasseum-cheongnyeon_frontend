<script setup>
import { watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  variant: { type: String, default: 'info' },
  duration: { type: Number, default: 3000 },
  position: { type: String, default: 'bottom' },
})

const emit = defineEmits(['update:modelValue'])

let timer = null

watch(
  () => props.modelValue,
  (visible) => {
    clearTimeout(timer)
    if (visible) {
      timer = setTimeout(() => emit('update:modelValue', false), props.duration)
    }
  },
)
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="toast" :class="[`toast--${variant}`, `toast--${position}`]">
      <slot />
    </div>
  </Teleport>
</template>

<style scoped>
.toast {
  position: fixed;
  left: 50%;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  white-space: nowrap;
  z-index: 1100;
  background: #2a2a2a;
  color: #e3ffe8;
}

.toast--bottom {
  bottom: 32px;
  transform: translateX(-50%);
}

.toast--center {
  top: 50%;
  transform: translate(-50%, -50%);
}

.toast--top {
  top: 68px;
  width: calc(100% - 32px);
  max-width: 368px;
  transform: translateX(-50%);
  text-align: center;
}

.toast--success {
  background: var(--color-mint-strong, #c1e8c8);
  color: var(--color-mint-deep, #16281c);
}

.toast--error {
  background: var(--color-point, #c1442e);
  color: #ffffff;
}
</style>
