<script setup>
defineProps({
  title: { type: String, default: '' },
  showBack: { type: Boolean, default: true },
})

defineEmits(['back'])
</script>

<template>
  <header class="app-header">
    <button
      v-if="showBack"
      type="button"
      class="app-header__back"
      aria-label="뒤로가기"
      @click="$emit('back')"
    >
      <svg viewBox="0 0 12 12" width="12" height="12">
        <path
          d="M8 1L2 6L8 11"
          fill="none"
          stroke="currentColor"
          stroke-width="1.9"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
    <span v-else class="app-header__spacer" />
    <h1 class="app-header__title">{{ title }}</h1>
    <div class="app-header__action">
      <slot name="action" />
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  width: 100%;
  padding: 3px 0 12px;
  position: sticky;
  top: 0;
  z-index: 5;
  background: var(--color-app-bg, #111111);
  border-bottom: 1px solid var(--color-border, #262626);
}

.app-header__back {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  justify-self: start;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: none;
  color: var(--color-text-primary, #ffffff);
  cursor: pointer;
}

.app-header__back::before {
  content: '';
  position: absolute;
  inset: -8px;
}

.app-header__title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.app-header__spacer {
  width: 24px;
  height: 24px;
  justify-self: start;
}

.app-header__action {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 24px;
  height: 24px;
  justify-self: end;
}
</style>
