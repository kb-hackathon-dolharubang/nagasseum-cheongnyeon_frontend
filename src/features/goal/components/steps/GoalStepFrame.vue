<script setup>
defineProps({
  // 줄바꿈(\n)을 그대로 살려 두 줄짜리 질문을 만든다 — white-space: pre-line으로 렌더한다.
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>

<template>
  <section class="goal-step-frame">
    <header class="goal-step-frame__head">
      <h2 class="goal-step-frame__title">{{ title }}</h2>
      <p v-if="description" class="goal-step-frame__description">{{ description }}</p>
    </header>
    <div class="goal-step-frame__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.goal-step-frame {
  display: flex;
  flex-direction: column;
  gap: 32px;
  width: 100%;
}

.goal-step-frame__head {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.goal-step-frame__title {
  margin: 0;
  /* 질문 문구의 \n을 줄바꿈으로 그대로 살린다 */
  white-space: pre-line;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.38;
  letter-spacing: -0.5px;
  color: var(--color-text-primary, #ffffff);
}

.goal-step-frame__description {
  margin: 0;
  font-size: 13.2px;
  line-height: 1.6;
  color: var(--color-text-secondary, #9aa09a);
}

.goal-step-frame__body {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
</style>
