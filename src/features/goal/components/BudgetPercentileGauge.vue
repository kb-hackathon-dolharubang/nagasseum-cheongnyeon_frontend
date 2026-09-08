<script setup>
import { computed } from 'vue'

import runnerImage from '@/features/compare/assets/runner.png'
import { formatEok } from '@/shared/utils/formatter'

const props = defineProps({
  p25: { type: Number, required: true },
  median: { type: Number, required: true },
  p75: { type: Number, required: true },
  myBudget: { type: Number, required: true },
  isSufficient: { type: Boolean, required: true },
})

// MarketPriceAlertCard와 동일한 패턴: 표시할 값들의 최소/최대를 도메인으로 잡고 일정 구간 안에 배치한다.
// 내 예산이 25~75% 구간을 벗어나도(예: 훨씬 여유로운 경우) 도메인에 포함되므로 트랙 안에서 항상 보인다.
// 내 예산이 도메인의 min/max 자체가 되는 경우(가장 흔한 케이스)에도 배지가 잘리지 않도록
// 여백을 넉넉히 두고(18~82%) 배치한다.
const domain = computed(() => {
  const values = [props.p25, props.median, props.p75, props.myBudget]
  return { min: Math.min(...values), max: Math.max(...values) }
})

function percentOf(value) {
  const { min, max } = domain.value
  const range = max - min
  return range === 0 ? 50 : 18 + ((value - min) / range) * 64
}

const p25Percent = computed(() => percentOf(props.p25))
const medianPercent = computed(() => percentOf(props.median))
const p75Percent = computed(() => percentOf(props.p75))
const myBudgetPercent = computed(() => percentOf(props.myBudget))

// 트랙 배경을 왼쪽(부족)→오른쪽(충분) 그라데이션으로 표시한다.
// 색이 절반쯤 섞이는 지점을 중앙값(median) 위치에 맞춰, "중앙값을 기준으로 부족/충분이 갈린다"는
// 의미가 시각적으로도 드러나게 한다.
const trackGradient = computed(() => {
  const center = medianPercent.value
  const spread = 15
  const start = Math.max(center - spread, 0)
  const end = Math.min(center + spread, 100)
  return `linear-gradient(to right, rgba(122, 42, 31, 0.5) 0%, rgba(122, 42, 31, 0.5) ${start}%, rgba(11, 59, 36, 0.5) ${end}%, rgba(11, 59, 36, 0.5) 100%)`
})
</script>

<template>
  <div class="budget-gauge">
    <div
      class="budget-gauge__badge"
      :class="
        isSufficient ? 'budget-gauge__badge--sufficient' : 'budget-gauge__badge--insufficient'
      "
      :style="{ left: `${myBudgetPercent}%` }"
    >
      {{ formatEok(myBudget) }}
    </div>

    <div class="budget-gauge__track" :style="{ background: trackGradient }">
      <div class="budget-gauge__tick-mark" :style="{ left: `${p25Percent}%` }" />
      <div class="budget-gauge__tick-mark" :style="{ left: `${medianPercent}%` }" />
      <div class="budget-gauge__tick-mark" :style="{ left: `${p75Percent}%` }" />
      <img
        class="budget-gauge__runner"
        :src="runnerImage"
        alt=""
        :style="{ left: `${myBudgetPercent}%` }"
      />
    </div>

    <div class="budget-gauge__ticks">
      <div class="budget-gauge__tick" :style="{ left: `${p25Percent}%` }">
        <span class="budget-gauge__tick-label">25%</span>
        <span class="budget-gauge__tick-amount">{{ formatEok(p25) }}</span>
      </div>
      <div class="budget-gauge__tick" :style="{ left: `${medianPercent}%` }">
        <span class="budget-gauge__tick-label">중앙값</span>
        <span class="budget-gauge__tick-amount">{{ formatEok(median) }}</span>
      </div>
      <div class="budget-gauge__tick" :style="{ left: `${p75Percent}%` }">
        <span class="budget-gauge__tick-label">75%</span>
        <span class="budget-gauge__tick-amount">{{ formatEok(p75) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.budget-gauge {
  position: relative;
  width: 100%;
  padding-top: 26px;
}

.budget-gauge__badge {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  line-height: 1.2;
  font-weight: 700;
  white-space: nowrap;
}

.budget-gauge__badge--insufficient {
  background: #ff7a45;
  color: #1a1a1a;
}

.budget-gauge__badge--sufficient {
  background: #b3e7bd;
  color: #16281c;
}

.budget-gauge__track {
  position: relative;
  height: 4px;
  margin: 12px 0 0;
  border-radius: 2px;
}

/* 25%/중앙값/75% 위치를 트랙 세로 중간을 가로지르는 짧은 선으로 표시 */
.budget-gauge__tick-mark {
  position: absolute;
  top: 50%;
  width: 2px;
  height: 10px;
  transform: translate(-50%, -50%);
  background: #1f2b25;
}

.budget-gauge__runner {
  position: absolute;
  top: 50%;
  width: 28px;
  height: 28px;
  transform: translate(-50%, -50%);
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  image-rendering: pixelated;
  pointer-events: none;
}

.budget-gauge__ticks {
  position: relative;
  height: 26px;
  margin-top: 6px;
}

.budget-gauge__tick {
  position: absolute;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translateX(-50%);
}

.budget-gauge__tick-label {
  font-size: 11px;
  line-height: 1.2;
  color: #4a5a52;
}

.budget-gauge__tick-amount {
  margin-top: 1px;
  font-size: 12px;
  line-height: 1.2;
  font-weight: 700;
  color: #1f2b25;
  white-space: nowrap;
}
</style>
