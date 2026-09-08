<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <Teleport to="body">
    <Transition name="base-bottom-sheet">
      <div
        v-if="modelValue"
        class="base-bottom-sheet-overlay"
        @click.self="$emit('update:modelValue', false)"
      >
        <section class="base-bottom-sheet" role="dialog" aria-modal="true">
          <span class="base-bottom-sheet__handle" aria-hidden="true" />

          <div class="base-bottom-sheet__scroll">
            <h2 v-if="title" class="base-bottom-sheet__title">{{ title }}</h2>
            <slot />
          </div>

          <footer v-if="$slots.footer" class="base-bottom-sheet__footer">
            <slot name="footer" />
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.base-bottom-sheet-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
}

.base-bottom-sheet-enter-active,
.base-bottom-sheet-leave-active {
  transition: opacity 0.22s ease;
}

.base-bottom-sheet-enter-active .base-bottom-sheet,
.base-bottom-sheet-leave-active .base-bottom-sheet {
  transition: transform 0.22s cubic-bezier(0.32, 0.72, 0, 1);
}

.base-bottom-sheet-enter-from,
.base-bottom-sheet-leave-to {
  opacity: 0;
}

.base-bottom-sheet-enter-from .base-bottom-sheet,
.base-bottom-sheet-leave-to .base-bottom-sheet {
  transform: translateY(100%);
}

.base-bottom-sheet {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px;
  /* 화면 높이를 넘는 내용은 시트 안(__scroll)에서만 스크롤한다 - 뒤 페이지는 overlay가
     전체 화면을 덮고 있어 같이 스크롤되지 않는다. */
  max-height: min(85dvh, 640px);
  padding: 10px 16px calc(16px + env(safe-area-inset-bottom, 0px));
  border-radius: 24px 24px 0 0;
  background: var(--color-surface, #161616);
  box-shadow: 0 -12px 32px rgba(16, 19, 15, 0.12);
}

.base-bottom-sheet__handle {
  flex: none;
  width: 36px;
  height: 4px;
  margin: 0 auto 14px;
  border-radius: 999px;
  background: var(--color-border, #262626);
}

.base-bottom-sheet__scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.base-bottom-sheet__title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.base-bottom-sheet__footer {
  flex: none;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--color-border, #262626);
}
</style>
