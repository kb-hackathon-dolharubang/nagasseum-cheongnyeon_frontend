<script setup>
defineProps({
  modelValue: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue', 'close'])

const SORT_OPTIONS = [
  { value: 'recommended', label: '추천순' },
  { value: 'deadline', label: '마감임박순' },
  { value: 'alphabetical', label: '가나다순' },
]

function select(value) {
  emit('update:modelValue', value)
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div class="sort-sheet-overlay" @click.self="emit('close')">
      <div class="sort-sheet">
        <div class="sort-sheet__handle" />
        <p class="sort-sheet__title">정렬 기준</p>
        <ul class="sort-sheet__list">
          <li
            v-for="option in SORT_OPTIONS"
            :key="option.value"
            class="sort-sheet__item"
            :class="{ 'sort-sheet__item--active': modelValue === option.value }"
            @click="select(option.value)"
          >
            {{ option.label }}
            <span v-if="modelValue === option.value" class="sort-sheet__check">✓</span>
          </li>
        </ul>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.sort-sheet-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.sort-sheet {
  width: 100%;
  max-width: 400px;
  background: var(--color-surface, #161616);
  border-top: 1px solid var(--color-border, #262626);
  border-radius: 20px 20px 0 0;
  padding: 12px 16px 32px;
}

.sort-sheet__handle {
  width: 36px;
  height: 4px;
  background: var(--color-border, #262626);
  border-radius: 2px;
  margin: 0 auto 16px;
}

.sort-sheet__title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
  font-family: var(--sans-normal);
}

.sort-sheet__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sort-sheet__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 16px;
  border: 1px solid var(--color-border, #262626);
  border-radius: 12px;
  font-size: 14px;
  color: var(--color-text-secondary, #9aa09a);
  font-family: var(--sans-normal);
  cursor: pointer;
  transition: background 0.15s ease;
}

.sort-sheet__item--active {
  border-color: var(--color-primary, #1d6b3f);
  background: var(--color-primary-soft, #e3ffe8);
  color: var(--color-primary, #1d6b3f);
  font-weight: 700;
}

.sort-sheet__check {
  font-size: 14px;
}
</style>
