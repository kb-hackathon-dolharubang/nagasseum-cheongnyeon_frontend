<script setup>
defineProps({
  // 1부터 시작하는 현재 단계 번호
  current: { type: Number, required: true },
  total: { type: Number, required: true },
})
</script>

<template>
  <div class="goal-step-progress">
    <!--
      단계 수가 거래 유형에 따라 달라지므로(월세 단계) 눈금 개수도 같이 변한다.
      진행률을 %로만 보여주면 단계가 하나 늘 때 막대가 뒤로 밀린 것처럼 보여서, 칸 자체를 나눠 그린다.
    -->
    <div class="goal-step-progress__ticks">
      <span
        v-for="step in total"
        :key="step"
        class="goal-step-progress__tick"
        :class="{
          'goal-step-progress__tick--done': step < current,
          'goal-step-progress__tick--current': step === current,
        }"
      />
    </div>
    <p class="goal-step-progress__count">
      <span class="goal-step-progress__current">{{ current }}</span> / {{ total }}
    </p>
  </div>
</template>

<style scoped>
.goal-step-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.goal-step-progress__ticks {
  display: flex;
  flex: 1;
  gap: 4px;
  min-width: 0;
}

.goal-step-progress__tick {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: var(--color-progress-inactive, #262626);
  transition:
    background 0.25s ease,
    height 0.25s ease;
}

/* --color-progress-active(#c1e8c8)는 라이트 모드의 밝은 배경에서 거의 안 보인다.
   테마마다 대비가 확보돼 있는 버튼 색을 그대로 쓴다. */
.goal-step-progress__tick--done {
  background: var(--base-button-primary-bg, #e3ffe8);
}

.goal-step-progress__tick--current {
  height: 6px;
  background: var(--color-accent, #ffd939);
}

.goal-step-progress__count {
  margin: 0;
  flex: none;
  font-size: 12.5px;
  color: var(--color-text-tertiary, #6f766d);
}

.goal-step-progress__current {
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}
</style>
