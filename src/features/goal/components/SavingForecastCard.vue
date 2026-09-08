<script setup>
import { computed } from 'vue'

import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'
import { formatManwon, formatYearMonthKo } from '@/shared/utils/formatter'

const props = defineProps({
  // savingStatus { fixedSaving, recentAverageSaving, latestSaving } — 저축 기록이 부족하면 평균/최근 값이 없을 수 있다.
  savingStatus: { type: Object, required: true },
  // forecasts [{ basis, monthlySaving, expectedDate, monthsDiff }] — 기준별로 항목이 빠질 수 있다.
  forecasts: { type: Array, required: true },
  targetDate: { type: String, required: true },
})

defineEmits(['change-saving'])

const FORECAST_LABELS = {
  FIXED: '기존 예상 달성일',
  RECENT_AVERAGE: '최근 3개월 평균',
  LATEST: '최근 저축',
}

const latestForecast = computed(() => props.forecasts.find((f) => f.basis === 'LATEST'))
const averageForecast = computed(() => props.forecasts.find((f) => f.basis === 'RECENT_AVERAGE'))

// 저축액을 더/덜 냈을 때 예상 달성 시점이 어떻게 달라지는지 순수 비교만 하는 타임라인.
// "가까울수록 좋다"는 의미가 없으므로 등반가/깃발 대신 중립적인 점으로 표시한다.
// monthsDiff(목표 시점보다 몇 개월 빠른지)가 클수록 날짜가 이르므로 왼쪽에 두고,
// 목표 시점(monthsDiff=0)은 셋 중 가장 늦은 날짜이므로 오른쪽 끝에 온다.
// 매물 시세 변화 카드의 타임라인과 동일하게 18~82% 구간에 배치해 라벨이 가장자리에서 안 잘리게 하고,
// 시점(monthsDiff)이 완전히 같은 점은 점 하나로 합치고(라벨·금액을 이어붙임), 값은 달라도 위치가
// 가까운 점끼리는 라벨이 겹치지 않도록 최소 간격(MIN_GAP)을 보장한다.
const timelinePoints = computed(() => {
  const points = [
    {
      key: 'latest',
      label: '최근 저축',
      monthsDiff: latestForecast.value?.monthsDiff,
      amount: props.savingStatus.latestSaving,
    },
    {
      key: 'average',
      label: '3개월 평균',
      monthsDiff: averageForecast.value?.monthsDiff,
      amount: props.savingStatus.recentAverageSaving,
    },
    {
      key: 'target',
      label: '현재 목표',
      monthsDiff: 0,
      amount: props.savingStatus.fixedSaving,
    },
  ].filter((point) => typeof point.monthsDiff === 'number')

  const values = points.map((point) => -point.monthsDiff)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min

  const grouped = []
  points.forEach((point, i) => {
    const value = values[i]
    const existing = grouped.find((group) => group.value === value)
    if (existing) {
      existing.keys.push(point.key)
      existing.labels.push(point.label)
      existing.amounts.push(point.amount)
    } else {
      grouped.push({ keys: [point.key], value, labels: [point.label], amounts: [point.amount] })
    }
  })

  const withPercent = grouped.map((group) => ({
    ...group,
    percent: range === 0 ? 50 : 18 + ((group.value - min) / range) * 64,
  }))

  const MIN_GAP = 18
  const sortedByPercent = [...withPercent].sort((a, b) => a.percent - b.percent)
  for (let i = 1; i < sortedByPercent.length; i++) {
    const prev = sortedByPercent[i - 1]
    const curr = sortedByPercent[i]
    if (curr.percent - prev.percent < MIN_GAP) {
      curr.percent = prev.percent + MIN_GAP
    }
  }

  return withPercent
})

function forecastNote(forecast) {
  if (forecast.basis === 'FIXED' || !forecast.monthsDiff) return ''
  return forecast.monthsDiff > 0
    ? `예상 달성일이 ${forecast.monthsDiff}개월 앞당겨졌어요`
    : `예상 달성일이 ${-forecast.monthsDiff}개월 늦어졌어요`
}
</script>

<template>
  <section class="saving-forecast-card">
    <h2 class="saving-forecast-card__title">저축 금액에 따른 예상 달성 시점</h2>

    <div class="saving-forecast-card__gauge">
      <div class="saving-forecast-card__track">
        <div
          v-for="point in timelinePoints"
          :key="point.keys.join('-')"
          class="saving-forecast-card__point"
          :class="{ 'saving-forecast-card__point--target': point.keys.includes('target') }"
          :style="{ left: `${point.percent}%` }"
        >
          <span class="saving-forecast-card__dot" />
          <div class="saving-forecast-card__point-info">
            <span class="saving-forecast-card__point-label">{{ point.labels.join(' · ') }}</span>
            <span class="saving-forecast-card__point-amount">{{
              point.amounts.map((amount) => formatManwon(amount)).join(' · ')
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <ul class="saving-forecast-card__forecasts">
      <li
        v-for="forecast in forecasts"
        :key="forecast.basis"
        class="saving-forecast-card__forecast"
      >
        <div class="saving-forecast-card__forecast-main">
          <span class="saving-forecast-card__forecast-label">
            {{ FORECAST_LABELS[forecast.basis] ?? forecast.basis }} · 월
            {{ formatManwon(forecast.monthlySaving) }}
          </span>
          <!-- 남은 금액이 0이면 expectedDate가 null로 내려온다(달성 상태) -->
          <span class="saving-forecast-card__forecast-date">
            {{ forecast.expectedDate ? formatYearMonthKo(forecast.expectedDate) : '달성 완료' }}
          </span>
        </div>
        <p v-if="forecastNote(forecast)" class="saving-forecast-card__forecast-note">
          {{ forecastNote(forecast) }}
        </p>
      </li>
    </ul>

    <BaseButton
      variant="highlight"
      class="saving-forecast-card__cta"
      @click="$emit('change-saving')"
      >고정 저축액 변경하기</BaseButton
    >
  </section>
</template>

<style scoped>
.saving-forecast-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  border-radius: 16px;
  background: var(--color-surface, #272727);
  box-shadow: 0 2px 6px rgba(90, 143, 77, 0.06);
  font-weight: 500;
}

.saving-forecast-card__title {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-primary, #12281c);
}

.saving-forecast-card__gauge {
  padding: 8px 8px 64px;
}

.saving-forecast-card__track {
  position: relative;
  height: 6px;
}

/* 매물 시세 변화 카드의 회색 바와 두께(3px)를 맞추기 위해 실제 막대는 얇은
   가상요소로 그리고, 점들이 기준으로 삼는 6px 박스는 그대로 둔다. */
.saving-forecast-card__track::before {
  content: '';
  position: absolute;
  top: 1.5px;
  right: 0;
  left: 0;
  height: 3px;
  border-radius: 2px;
  background: var(--color-progress-inactive, #243624);
}

/* "가까울수록 좋다"는 의미가 없는 순수 비교라, 등반가/깃발 대신
   매물 시세 변화 카드와 같은 중립적인 점으로 세 시점을 표시한다. */
.saving-forecast-card__point {
  position: absolute;
  top: -3px;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  transform: translateX(-50%);
}

.saving-forecast-card__dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--color-progress-active, #9fd8ab);
  background: var(--color-progress-active, #9fd8ab);
}

.saving-forecast-card__point--target .saving-forecast-card__dot {
  border-color: var(--color-accent, #ffd939);
  background: var(--color-accent, #ffd939);
}

.saving-forecast-card__point-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

/* 매물 시세 변화 카드의 타임라인 라벨(.market-alert__point-label/-amount)과 스타일을 맞췄다. */
.saving-forecast-card__point-label {
  font-size: 13px;
  font-weight: 500;
  line-height: 1.3;
  color: var(--color-text-primary, #f5f5f5);
  text-align: center;
  white-space: nowrap;
  opacity: 0.7;
}

.saving-forecast-card__point-amount {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-primary, #f5f5f5);
  white-space: nowrap;
}

.saving-forecast-card__forecasts {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.saving-forecast-card__forecast-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.saving-forecast-card__forecast-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary, #f5f5f5);
  opacity: 0.7;
}

.saving-forecast-card__forecast-date {
  font-size: 19px;
  font-weight: 700;
  color: var(--color-text-primary, #f5f5f5);
}

.saving-forecast-card__forecast-note {
  margin: 2px 0 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary, #7fe3a0);
  text-align: right;
}

.saving-forecast-card :deep(.saving-forecast-card__cta) {
  height: 46px;
  background: var(--color-primary-soft, #e8f4ea);
  /* "다시 진단하기"(GoalRecommendationsView)와 같은 크기(16px, BaseButton lg 기본값)·
     색(--color-primary, 진한 초록)으로 맞춘다 */
  color: var(--color-primary, #1d6b3f);
  transition: background-color 0.15s ease;
}

/* "다시 진단하기"와 같은 hover 톤을 쓴다. 터치 기기에서 hover가 눌어붙지 않도록
   실제 hover 가능한 입력에서만 적용한다. */
@media (hover: hover) and (pointer: fine) {
  .saving-forecast-card :deep(.saving-forecast-card__cta):hover {
    background: var(--color-primary-soft-hover, #c2dec7);
  }
}
</style>
