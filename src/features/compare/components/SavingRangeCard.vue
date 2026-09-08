<script setup>
import { computed, onMounted, ref } from 'vue'

import runnerImage from '@/features/compare/assets/runner.png'

const TRACK_MAX = 1_500_000

const props = defineProps({
  myMonthlySaving: { type: Number, required: true },
  cohortRangeMin: { type: Number, required: true },
  cohortRangeMax: { type: Number, required: true },
})

const manwon = (won) => Math.round(won / 10000).toLocaleString()

const toPercent = (won) => Math.min(100, Math.max(0, (won / TRACK_MAX) * 100))

const rangeStartPct = computed(() => toPercent(props.cohortRangeMin))
const rangeEndPct = computed(() => toPercent(props.cohortRangeMax))
const myPct = computed(() => toPercent(props.myMonthlySaving))

// 첫 프레임은 출발선(0%)에 그려야 CSS transition이 진짜로 "달려오는" 움직임으로 보인다.
// rAF 없이 바로 목표값을 넣으면 브라우저가 중간 과정 없이 도착 지점만 그려버린다.
const isReady = ref(false)
onMounted(() => requestAnimationFrame(() => (isReady.value = true)))
const runnerPct = computed(() => (isReady.value ? myPct.value : 0))
const bandWidthPct = computed(() => (isReady.value ? rangeEndPct.value - rangeStartPct.value : 0))
</script>

<template>
  <div class="card">
    <p class="card__title">
      월 저축액 구간
      <span class="card__range">{{ manwon(cohortRangeMin) }}~{{ manwon(cohortRangeMax) }}만원</span>
    </p>

    <div class="gauge">
      <span class="gauge__my-label" :style="{ left: `${runnerPct}%` }">
        나 {{ manwon(myMonthlySaving) }}만
      </span>

      <div class="gauge__track">
        <span
          class="gauge__band"
          :style="{ left: `${rangeStartPct}%`, width: `${bandWidthPct}%` }"
        ></span>
      </div>

      <img class="gauge__runner" :src="runnerImage" alt="" :style="{ left: `${runnerPct}%` }" />

      <span class="gauge__tick" :style="{ left: `${rangeStartPct}%` }">
        {{ manwon(cohortRangeMin) }}만
      </span>
      <span class="gauge__tick" :style="{ left: `${rangeEndPct}%` }">
        {{ manwon(cohortRangeMax) }}만
      </span>
    </div>

    <div class="gauge__ends">
      <span>0</span>
      <span>{{ manwon(TRACK_MAX) }}만+</span>
    </div>
  </div>
</template>

<style scoped>
.card {
  --ink: var(--c-ink);
  --ink-muted: var(--c-ink-muted);
  --track: var(--c-track);
  --band: var(--c-accent-mid);

  border: 1px solid var(--c-line);
  border-radius: 14px;
  padding: 16px;
  background: var(--c-card);
  color: var(--ink);
  line-height: 1.45;
  animation: card-rise 0.35s ease-out both;
  animation-delay: 0.18s;
}

.card__title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 0;
  font-size: 15px;
  font-weight: 700;
}

.card__range {
  font-size: 13px;
  color: var(--ink-muted);
}

.gauge {
  position: relative;
  margin: 60px 0 22px;
}

.gauge__track {
  position: relative;
  height: 6px;
  background: var(--track);
}

.gauge__band {
  position: absolute;
  top: 0;
  height: 100%;
  background: var(--band);
  transition: width 0.7s cubic-bezier(0.22, 0.9, 0.32, 1) 0.5s;
}

.gauge__runner {
  position: absolute;
  bottom: 6px;
  width: 30px;
  height: 30px;
  transform: translateX(-50%);
  image-rendering: pixelated;
  transition: left 0.7s cubic-bezier(0.22, 0.9, 0.32, 1) 0.5s;
}

.gauge__my-label {
  position: absolute;
  bottom: 40px;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 12px;
  color: var(--c-value);
  transition: left 0.7s cubic-bezier(0.22, 0.9, 0.32, 1) 0.5s;
}

.gauge__tick {
  position: absolute;
  top: 14px;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 12px;
  color: var(--ink-muted);
}

.gauge__ends {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--ink-muted);
}
</style>
