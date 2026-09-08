<script setup>
defineProps({
  items: { type: Array, required: true },
  modelValue: { type: Number, default: 0 },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <nav class="bottom-nav">
    <span
      v-if="modelValue >= 0"
      class="bottom-nav__indicator"
      :style="{
        width: `calc((100% - 12px) / ${items.length} - 12px)`,
        left: `calc(5px + (100% - 12px) / ${items.length} * ${modelValue} + 6px)`,
      }"
    />
    <button
      v-for="(item, index) in items"
      :key="item.label"
      type="button"
      class="bottom-nav__item"
      :class="{ 'bottom-nav__item--active': index === modelValue }"
      @click="$emit('update:modelValue', index)"
    >
      <span class="bottom-nav__icon">
        <component :is="item.icon" v-if="item.icon" />
      </span>
      <span class="bottom-nav__label">{{ item.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 5px;
  border-radius: 26px;
  background: var(--color-nav-bg, #a6c7b7);
  box-shadow:
    0 -2px 8px rgba(0, 0, 0, 0.05),
    0 3px 10px rgba(0, 0, 0, 0.09);
  box-sizing: border-box;
}

.bottom-nav__indicator {
  position: absolute;
  top: 6px;
  bottom: 6px;
  border-radius: 20px;
  background: var(--color-nav-active-bg, #e3ffe8);
  transition: left 0.25s cubic-bezier(0.32, 0.72, 0, 1);
}

.bottom-nav__item {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 6px 8px;
  border: none;
  border-radius: 20px;
  background: transparent;
  color: var(--color-nav-inactive, #3e5a49);
  cursor: pointer;
  transition: color 0.18s ease;
}

.bottom-nav__item--active {
  color: var(--color-nav-active, #16281c);
}

.bottom-nav__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
}

.bottom-nav__item--active .bottom-nav__icon {
  animation: bottom-nav-icon-pop 0.28s ease;
}

@keyframes bottom-nav-icon-pop {
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.18);
  }
  100% {
    transform: scale(1);
  }
}

.bottom-nav__icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.bottom-nav__label {
  font-family: var(--sans-normal);
  font-size: 11.5px;
  font-weight: 700;
  white-space: nowrap;
}
</style>
