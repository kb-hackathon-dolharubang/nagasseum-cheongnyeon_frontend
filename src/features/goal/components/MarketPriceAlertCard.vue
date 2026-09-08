<script setup>
import { computed } from 'vue'

import BaseCard from '@/shared/components/atoms/base/card/BaseCard.vue'
import BaseBadge from '@/shared/components/atoms/base/badge/BaseBadge.vue'
import BaseDivider from '@/shared/components/atoms/base/divider/BaseDivider.vue'
import BaseHomeIcon from '@/shared/components/atoms/base/icon/BaseHomeIcon.vue'
import BaseCalendarIcon from '@/shared/components/atoms/base/icon/BaseCalendarIcon.vue'
import {
  formatEokManwon,
  formatChangeAmount,
  formatYearMonth,
  formatWon,
} from '@/shared/utils/formatter'

const props = defineProps({
  marketAlert: { type: Object, required: true },
})

// "2026-07" -> "2026년 7월 기준 실거래 시세" (날짜 + "실거래 시세"를 하나의 보조 제목으로 합친다)
const currentPriceLabel = computed(
  () => `${formatYearMonth(props.marketAlert.updatedYm)} 기준 실거래 시세`,
)

// "2027-08" -> "2027년 8월 목표" ("목표 시점 예상 시세" 영역 제목 아래 붙는 보조 문구)
const predictionTargetLabel = computed(
  () => `${formatYearMonth(props.marketAlert.predictionTargetYm)} 목표`,
)

// predictionChangeAmount 부호에 따라 헤더 뱃지 색/전망 변화 문구를 함께 결정한다.
// null이면(최신 몬테카를로 예측을 만들 수 없는 경우) 카드 전체를 에러 처리하지 않고
// 뱃지·변화 문구만 숨긴다. predictionTargetYm은 예측 결과가 아니라 목표 시점 정보라
// 예측 실패 여부와 무관하게 항상 내려오므로 이 판단에 쓰지 않는다.
const changeDirection = computed(() => {
  const amount = props.marketAlert.predictionChangeAmount
  if (amount === null || amount === undefined) return 'unknown'
  if (amount === 0) return 'same'
  return amount > 0 ? 'up' : 'down'
})

const changeAmountText = computed(() => {
  const amount = props.marketAlert.predictionChangeAmount
  return amount === null || amount === undefined ? '' : formatEokManwon(Math.abs(amount))
})
</script>

<template>
  <BaseCard class="market-alert">
    <div class="market-alert__header">
      <h2 class="market-alert__title">시세 전망 업데이트</h2>
      <BaseBadge v-if="changeDirection === 'up'" variant="point">
        {{ formatChangeAmount(marketAlert.predictionChangeAmount) }}
      </BaseBadge>
      <BaseBadge v-else-if="changeDirection === 'down'" variant="mint">
        {{ formatChangeAmount(marketAlert.predictionChangeAmount) }}
      </BaseBadge>
      <BaseBadge v-else-if="changeDirection === 'same'" variant="neutral">변화 없음</BaseBadge>
    </div>

    <section class="market-alert__current">
      <p class="market-alert__current-label">
        <BaseHomeIcon :size="12" class="market-alert__current-icon" />
        {{ currentPriceLabel }}
      </p>
      <p class="market-alert__current-amount">
        {{ formatWon(marketAlert.currentMiddleAmount) }}
      </p>
    </section>

    <BaseDivider class="market-alert__divider" />

    <section class="market-alert__prediction">
      <p class="market-alert__prediction-title">목표 시점 예상 시세</p>
      <p class="market-alert__prediction-sub">
        <BaseCalendarIcon :size="12" class="market-alert__prediction-icon" />
        {{ predictionTargetLabel }}
      </p>

      <div class="market-alert__compare">
        <div class="market-alert__compare-box">
          <span class="market-alert__compare-label">진단 당시 전망</span>
          <span class="market-alert__compare-value">{{
            formatEokManwon(marketAlert.initialMiddleAmount)
          }}</span>
        </div>
        <span
          v-if="marketAlert.latestPredictedMarketAmount !== null"
          class="market-alert__compare-arrow"
          >→</span
        >
        <div class="market-alert__compare-box">
          <span class="market-alert__compare-label">최신 전망</span>
          <span
            v-if="marketAlert.latestPredictedMarketAmount !== null"
            class="market-alert__compare-value market-alert__compare-value--latest"
            >{{ formatEokManwon(marketAlert.latestPredictedMarketAmount) }}</span
          >
          <span v-else class="market-alert__compare-value market-alert__compare-value--muted"
            >계산할 수 없어요</span
          >
        </div>
      </div>

      <p v-if="changeDirection !== 'unknown'" class="market-alert__change">
        <template v-if="changeDirection === 'same'">진단 당시와 예상 시세가 동일해요.</template>
        <template v-else
          >진단 당시보다 예상 시세가
          <span
            class="market-alert__change-emphasis"
            :class="`market-alert__change-emphasis--${changeDirection}`"
            >{{ changeAmountText }}
            {{ changeDirection === 'up' ? '높아졌어요' : '낮아졌어요' }}</span
          >.</template
        >
      </p>
    </section>
  </BaseCard>
</template>

<style scoped>
.market-alert {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--color-surface, #f7ffd1);
  font-weight: 500;
}

/* BaseCard 기본 padding(20px)을 달성률 카드와 같은 16px로 맞춘다.
   base-card--lg와 특이도를 맞춰야 확실히 덮어써서, 클래스 두 개를 함께 지정한다. */
.market-alert.base-card--lg {
  padding: 16px;
}

.market-alert__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* 카드 전체 gap(12px)을 쓰면 제목과 본문 사이가 다른 섹션 간격보다 넓어 보여서,
     제목 바로 아래 간격만 좁힌다. */
  margin-bottom: -16px;
}

.market-alert__title {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-primary, #12281c);
}

.market-alert__current {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.market-alert__current-label {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  font-size: 12px;
  color: var(--color-text-primary, #16281c);
  opacity: 0.7;
}

.market-alert__current-icon {
  flex-shrink: 0;
}

.market-alert__current-amount {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  color: var(--color-text-primary, #16281c);
}

.market-alert__divider {
  background: var(--color-progress-inactive, #243624);
}

.market-alert__prediction {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.market-alert__prediction-title {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-primary, #16281c);
}

.market-alert__prediction-sub {
  /* 제목과 한 쌍의 헤딩처럼 붙어 보이도록 섹션 gap(8px)보다 좁힌다. */
  display: flex;
  align-items: center;
  gap: 4px;
  margin: -4px 0 0;
  font-size: 12px;
  color: var(--color-text-primary, #16281c);
  opacity: 0.7;
}

.market-alert__prediction-icon {
  flex-shrink: 0;
}

.market-alert__compare {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: var(--color-app-bg, #effab8);
  border-radius: 10px;
}

.market-alert__compare-arrow {
  flex-shrink: 0;
  color: var(--color-text-primary, #16281c);
  opacity: 0.7;
  font-size: 13px;
}

.market-alert__compare-box {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.market-alert__compare-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary, #16281c);
  opacity: 0.7;
}

.market-alert__compare-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary, #16281c);
}

/* "최신 전망" 쪽만 초록으로 강조한다(기존 "반영 시" 박스와 같은 방식). */
.market-alert__compare-value--latest {
  color: var(--color-primary, #16281c);
}

.market-alert__compare-value--muted {
  font-size: 14px;
  font-weight: 500;
  opacity: 0.6;
}

.market-alert__change {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary, #16281c);
}

/* 비교 박스(1억원 → 1억 500만원)가 가장 중요한 정보로 보이도록, 문장 전체가 아니라
   변화량 부분(emphasis)만 강조한다. 전망 상승(매수자에게 불리)은 빨강, 하락(매수자에게
   유리)은 초록으로 강조한다. */
.market-alert__change-emphasis {
  font-weight: 700;
}

.market-alert__change-emphasis--up {
  color: var(--color-point, #c1442e);
}

.market-alert__change-emphasis--down {
  color: var(--color-primary, #1d6b3f);
}
</style>
