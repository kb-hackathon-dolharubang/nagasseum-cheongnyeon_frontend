<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <Teleport to="body">
    <Transition name="base-modal">
      <div
        v-if="modelValue"
        class="base-modal-overlay"
        @click.self="$emit('update:modelValue', false)"
      >
        <div class="base-modal">
          <header v-if="title" class="base-modal__header">
            <h2>{{ title }}</h2>
          </header>
          <div class="base-modal__body">
            <slot />
          </div>
          <footer v-if="$slots.footer" class="base-modal__footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.base-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.base-modal-enter-active,
.base-modal-leave-active {
  transition: opacity 0.18s ease;
}

.base-modal-enter-active .base-modal,
.base-modal-leave-active .base-modal {
  transition: transform 0.18s cubic-bezier(0.32, 0.72, 0, 1);
}

.base-modal-enter-from,
.base-modal-leave-to {
  opacity: 0;
}

.base-modal-enter-from .base-modal,
.base-modal-leave-to .base-modal {
  transform: scale(0.96);
}

.base-modal {
  display: flex;
  flex-direction: column;
  background: var(--modal-surface, #becfc7);
  border-radius: 22px;
  padding: 14px 0 14px 16px;
  width: 85vw;
  max-width: 320px;
}

.base-modal__header {
  padding-right: 16px;
}

.base-modal__header h2 {
  margin: 0 0 12px;
  color: var(--color-text-primary, #1f2b25);
  font-size: 17px;
  font-weight: 700;
  text-align: center;
}

.base-modal__body {
  padding-right: 16px;
}

.base-modal__footer {
  display: flex;
  flex-shrink: 0;
  gap: 10px;
  padding-top: 16px;
  padding-right: 16px;
}
</style>
