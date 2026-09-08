<script setup>
import BaseFieldBadge from '@/shared/components/atoms/base/badge/BaseFieldBadge.vue'
import BaseInput from '@/shared/components/atoms/base/input/BaseInput.vue'

defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  required: { type: Boolean, default: false },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  helperText: { type: String, default: '' },
  maxLength: { type: Number, default: 0 },
  showCounter: { type: Boolean, default: true },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="base-input-field">
    <div v-if="label" class="base-input-field__label-row">
      <span class="base-input-field__label">{{ label }}</span>
      <BaseFieldBadge :required="required" />
    </div>
    <div class="base-input-field__input-row">
      <BaseInput
        :model-value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :maxlength="maxLength || undefined"
        @update:model-value="$emit('update:modelValue', $event)"
      />
      <span v-if="maxLength && showCounter" class="base-input-field__counter">
        {{ String(modelValue).length }}/{{ maxLength }}
      </span>
      <span v-if="$slots.suffix" class="base-input-field__suffix">
        <slot name="suffix" />
      </span>
    </div>
    <p v-if="helperText" class="base-input-field__helper">{{ helperText }}</p>
  </div>
</template>

<style scoped>
.base-input-field {
  width: 100%;
}

.base-input-field__label-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.base-input-field__label {
  color: var(--text-h, #ffffff);
  font-weight: 500;
}

.base-input-field__input-row {
  position: relative;
}

.base-input-field__counter {
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  font-size: 12.4px;
  color: #565c57;
  pointer-events: none;
}

.base-input-field__suffix {
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  font-size: 13px;
  color: var(--color-text-secondary, #9aa09a);
  pointer-events: none;
}

.base-input-field__helper {
  margin: 8px 0 0;
  font-size: 11.1px;
  color: var(--text, #6e756f);
}
</style>
