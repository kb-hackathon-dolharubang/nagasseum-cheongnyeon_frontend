<script setup>
import { nextTick } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  size: { type: String, default: 'default' },
})

const emit = defineEmits(['update:modelValue'])

function onInput(event) {
  emit('update:modelValue', event.target.value)

  nextTick(() => {
    const expected = String(props.modelValue)
    if (event.target.value !== expected) {
      event.target.value = expected
    }
  })
}
</script>

<template>
  <input
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    class="base-input"
    :class="`base-input--${size}`"
    @input="onInput"
  />
</template>

<style scoped>
.base-input {
  padding: 8px 12px;
  border: 1px solid var(--border, #e5e4e7);
  border-radius: 6px;
  box-sizing: border-box;
}

.base-input--default {
  width: 100%;
}

.base-input--sm {
  width: 120px;
}

.base-input::-webkit-outer-spin-button,
.base-input::-webkit-inner-spin-button {
  margin: 0;
  appearance: none;
}

.base-input[type='number'] {
  appearance: textfield;
}
</style>
