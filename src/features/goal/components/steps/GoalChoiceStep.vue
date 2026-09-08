<script setup>
const props = defineProps({
  options: { type: Array, required: true }, // [{ label, value }]
  modelValue: { type: [String, Number, null], default: null },
})

const emit = defineEmits(['update:modelValue'])

// 한 번 더 누르면 선택이 풀린다. 화면당 질문이 하나뿐이라 "고른 걸 취소하고 싶다"가
// 곧 "이 조건은 안 정하겠다"는 뜻이 되고, 그건 건너뛰기와 같은 결과다.
function toggle(value) {
  emit('update:modelValue', value === props.modelValue ? null : value)
}
</script>

<template>
  <div class="goal-choice-step">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="goal-choice-step__option"
      :class="{ 'goal-choice-step__option--active': option.value === modelValue }"
      :aria-pressed="option.value === modelValue"
      @click="toggle(option.value)"
    >
      <span class="goal-choice-step__label">{{ option.label }}</span>
      <span class="goal-choice-step__check" aria-hidden="true">
        <svg viewBox="0 0 16 16" width="12" height="12">
          <path
            d="M3 8.5L6.5 12L13 4.5"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    </button>
  </div>
</template>

<style scoped>
.goal-choice-step {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.goal-choice-step__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 18px 20px;
  border: 1px solid var(--color-border, #262626);
  border-radius: 15px;
  background: var(--color-surface, #161616);
  color: var(--color-text-secondary, #9aa09a);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    background 0.18s ease,
    color 0.18s ease,
    border-color 0.18s ease;
}

.goal-choice-step__label {
  font-size: 15.5px;
  font-weight: 500;
}

.goal-choice-step__option--active {
  border-color: transparent;
  background: var(--base-button-primary-bg, #e3ffe8);
  color: var(--base-button-primary-text, #16281c);
}

.goal-choice-step__option--active .goal-choice-step__label {
  font-weight: 700;
}

.goal-choice-step__check {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 22px;
  height: 22px;
  border: 1.5px solid var(--color-border, #262626);
  border-radius: 50%;
  color: transparent;
}

.goal-choice-step__option--active .goal-choice-step__check {
  border-color: currentColor;
  color: var(--base-button-primary-text, #16281c);
}
</style>
