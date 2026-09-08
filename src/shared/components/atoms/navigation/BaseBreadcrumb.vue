<script setup>
const props = defineProps({
  steps: { type: Array, required: true },
  current: { type: Number, default: 1 },
})

function statusOf(index) {
  const step = index + 1
  if (step < props.current) return 'done'
  if (step === props.current) return 'active'
  return 'upcoming'
}
</script>

<template>
  <ol class="breadcrumb">
    <template v-for="(step, index) in steps" :key="step.label">
      <li class="breadcrumb__step">
        <span class="breadcrumb__circle" :class="`breadcrumb__circle--${statusOf(index)}`">
          <svg
            v-if="statusOf(index) === 'done'"
            class="breadcrumb__check"
            viewBox="0 0 16 16"
            width="12"
            height="12"
          >
            <path
              d="M3 8.5L6.5 12L13 4.5"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <template v-else>{{ index + 1 }}</template>
        </span>
        <span class="breadcrumb__label" :class="`breadcrumb__label--${statusOf(index)}`">
          {{ step.label }}
        </span>
      </li>
      <li
        v-if="index < steps.length - 1"
        class="breadcrumb__connector"
        :class="`breadcrumb__connector--${statusOf(index)}`"
      />
    </template>
  </ol>
</template>

<style scoped>
.breadcrumb {
  display: inline-flex;
  align-items: flex-start;
  margin: 0;
  padding: 0;
  list-style: none;
}

.breadcrumb__step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.breadcrumb__circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 700;
  box-sizing: border-box;
}

.breadcrumb__circle--done,
.breadcrumb__circle--active {
  background: var(--color-mint-strong, #c1e8c8);
  color: var(--color-mint-deep, #16281c);
}

.breadcrumb__circle--upcoming {
  border: 1px solid var(--color-toggle-off, #383e3a);
  color: var(--text, #9aa09a);
}

.breadcrumb__label {
  font-size: 13px;
  white-space: nowrap;
}

.breadcrumb__label--done,
.breadcrumb__label--active {
  color: var(--text-h, #ffffff);
}

.breadcrumb__label--active {
  font-weight: 700;
}

.breadcrumb__label--upcoming {
  color: var(--text, #9aa09a);
}

.breadcrumb__connector {
  width: 64px;
  height: 2px;
  margin: 13px 8px 0;
}

.breadcrumb__connector--done {
  background: var(--color-mint-strong, #c1e8c8);
}

.breadcrumb__connector--active,
.breadcrumb__connector--upcoming {
  background: var(--color-toggle-off, #383e3a);
}
</style>
