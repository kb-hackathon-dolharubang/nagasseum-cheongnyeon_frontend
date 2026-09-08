<script setup>
import { computed } from 'vue'

import { formatWon } from '@/shared/utils/formatter'

const props = defineProps({
  // 목표 달성 상세 조회 응답의 progress { targetAmount, currentAmount, remainingAmount, achievementRate }
  progress: { type: Object, required: true },
})

// 달성률 게이지는 20칸(= 5%p 단위)으로 쪼개 표시한다.
const TOTAL_SEGMENTS = 20

const roundedRate = computed(() => Math.round(props.progress.achievementRate))

const filledSegments = computed(() =>
  Math.min(Math.round(props.progress.achievementRate / (100 / TOTAL_SEGMENTS)), TOTAL_SEGMENTS),
)

// 채워진 칸 중 마지막 한 칸만 "현재 위치"로 강조한다.
function segmentModifier(index) {
  if (index > filledSegments.value) return 'goal-progress-card__segment--empty'
  if (index === filledSegments.value) return 'goal-progress-card__segment--current'
  return 'goal-progress-card__segment--filled'
}
</script>

<template>
  <section class="goal-progress-card">
    <header class="goal-progress-card__header">
      <span class="goal-progress-card__label">달성률</span>
      <strong class="goal-progress-card__rate">{{ roundedRate }}%</strong>
    </header>

    <div
      class="goal-progress-card__segments"
      role="progressbar"
      :aria-valuenow="roundedRate"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <span
        v-for="n in TOTAL_SEGMENTS"
        :key="n"
        class="goal-progress-card__segment"
        :class="segmentModifier(n)"
      />
    </div>

    <div class="goal-progress-card__stats">
      <div class="goal-progress-card__stat">
        <span class="goal-progress-card__stat-label">목표 금액</span>
        <strong class="goal-progress-card__stat-value">{{
          formatWon(progress.targetAmount)
        }}</strong>
      </div>
      <div class="goal-progress-card__stat">
        <span class="goal-progress-card__stat-label">현재 자금</span>
        <strong class="goal-progress-card__stat-value">{{
          formatWon(progress.currentAmount)
        }}</strong>
      </div>
      <div class="goal-progress-card__stat goal-progress-card__stat--wide">
        <span class="goal-progress-card__stat-label">남은 금액</span>
        <strong class="goal-progress-card__stat-value">{{
          formatWon(progress.remainingAmount)
        }}</strong>
      </div>
    </div>
  </section>
</template>

<style scoped>
.goal-progress-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 16px;
  background: var(--color-surface, #161616);
  font-weight: 500;
}

.goal-progress-card__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.goal-progress-card__label {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-primary, #12281c);
}

.goal-progress-card__rate {
  font-size: 26px;
  font-weight: 700;
  line-height: 1;
  color: var(--color-primary, #1d6b3f);
}

.goal-progress-card__segments {
  display: flex;
  gap: 3px;
}

.goal-progress-card__segment {
  flex: 1;
  height: 16px;
  border-radius: 3px;
}

.goal-progress-card__segment--filled {
  background: var(--color-progress-active, #1d6b3f);
}

.goal-progress-card__segment--current {
  background: var(--color-accent, #ffd939);
}

.goal-progress-card__segment--empty {
  background: var(--color-progress-inactive, #b6d4bd);
}

.goal-progress-card__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.goal-progress-card__stat {
  display: flex;
  flex: 1 1 calc(50% - 8px);
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--color-app-bg, #ffffff);
}

.goal-progress-card__stat--wide {
  flex-basis: 100%;
}

.goal-progress-card__stat-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-primary, #2f6b4f);
  opacity: 0.7;
}

.goal-progress-card__stat-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary, #0b3b24);
}

/* 남은 금액 숫자만 크기를 그대로 두고(20px) 강조 색으로 구분한다. */
.goal-progress-card__stat--wide .goal-progress-card__stat-value {
  font-size: 20px;
  color: var(--color-primary, #1d6b3f);
}
</style>
