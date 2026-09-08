<script setup>
const props = defineProps({
  options: { type: Array, required: true },
  modelValue: { type: [String, Number, null], default: null },
})

const emit = defineEmits(['update:modelValue'])

function handleClick(value) {
  emit('update:modelValue', value === props.modelValue ? null : value)
}
</script>

<template>
  <div class="option-card-group">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="option-card-group__item"
      :class="{ 'option-card-group__item--active': option.value === modelValue }"
      @click="handleClick(option.value)"
    >
      <span class="option-card-group__label">{{ option.label }}</span>
      <span class="option-card-group__sublabel">{{ option.sublabel }}</span>
    </button>
  </div>
</template>

<style scoped>
.option-card-group {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px 6px;
  width: 100%;
}

.option-card-group__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 60px;
  padding: 0 4px;
  border: 1px solid var(--border, #2c302e);
  border-radius: 13px;
  background: none;
  cursor: pointer;
}

.option-card-group__label {
  font-size: 13.2px;
  color: #e6e9e6;
}

.option-card-group__sublabel {
  font-size: 10.5px;
  color: #7a807a;
}

.option-card-group__item--active {
  border-color: transparent;
  background: var(--accent, #e3ffe8);
}

.option-card-group__item--active .option-card-group__label {
  color: var(--color-mint-deep, #16281c);
}

.option-card-group__item--active .option-card-group__sublabel {
  color: #5c7a63;
}
</style>
