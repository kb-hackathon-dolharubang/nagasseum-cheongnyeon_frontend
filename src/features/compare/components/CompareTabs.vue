<script setup>
import lockedImage from '@/features/compare/assets/locked.png'

defineProps({
  activeTab: { type: String, required: true }, // 'asset' | 'goal'
  goalLocked: { type: Boolean, default: false },
})

defineEmits(['select'])
</script>

<template>
  <div class="tabs" role="tablist">
    <button
      type="button"
      role="tab"
      class="tabs__item"
      :class="{ 'tabs__item--active': activeTab === 'asset' }"
      :aria-selected="activeTab === 'asset'"
      @click="$emit('select', 'asset')"
    >
      자산 비교
    </button>
    <button
      type="button"
      role="tab"
      class="tabs__item"
      :class="{ 'tabs__item--active': activeTab === 'goal' }"
      :aria-selected="activeTab === 'goal'"
      @click="$emit('select', 'goal')"
    >
      목표 비교
      <img v-if="goalLocked" class="tabs__lock" :src="lockedImage" alt="" />
    </button>
  </div>
</template>

<style scoped>
.tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  padding: 4px;
  border-radius: 14px;
  background: var(--c-card);
  border: 1px solid var(--c-line);
}

.tabs__item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: 0;
  border-radius: 10px;
  padding: 9px 0;
  background: none;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: var(--c-ink-muted);
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    color 0.18s ease;
}

.tabs__item--active {
  background: var(--c-accent-soft);
  color: var(--c-accent);
}

.tabs__lock {
  width: 12px;
  height: 12px;
  image-rendering: pixelated;
}
</style>
