<script setup>
import { computed } from 'vue'

import BaseCard from '@/shared/components/atoms/base/card/BaseCard.vue'
import BaseDivider from '@/shared/components/atoms/base/divider/BaseDivider.vue'
import { formatEokManwon, formatYearMonth } from '@/shared/utils/formatter'

const props = defineProps({
  goal: { type: Object, required: true },
  // "목표를 위해 매달 얼마씩 모으는지"는 보유 자산 현황보다 목표 계획 정보에 가까워
  // TotalAssetCard가 "고정 저축액"으로 보여주던 assetSummary.monthlySavings를 이 카드로
  // 옮겨받는다 — 새 데이터를 만들지 않고 같은 값을 그대로 받아 쓴다. 자산 요약이 아직 없을
  // 수 있어(동기화 전 등) optional로 두고, 없으면 이 row를 숨긴다(값을 지어내지 않는다).
  monthlySaving: { type: Number, default: null },
  // 시세 변화가 목표 도달 시점에 미친 영향을 요약한 한 줄, { prefix, emphasis } 형태.
  // 문장 전체가 아니라 실제로 바뀌는 값(emphasis)만 강조색으로 보여주기 위해 나눠서 받는다.
  // 데이터가 없으면(시세 API 실패, 변화 없음 등) null이 오고, 그 경우 이 카드는 조용히
  // 해당 줄을 숨긴다.
  marketInsight: { type: Object, default: null },
})

/**
 * 카드 한 줄에 들어갈 만큼 줄인 지역명.
 *
 * <p>서버는 "서울특별시 강남구"처럼 시도까지 붙여서 준다. 한 줄에 주거형태·거래유형까지
 * 같이 들어가야 해서 시도는 뗀다.
 *
 * <pre>
 *   서울특별시 강남구      → 강남구
 *   경기도 부천시         → 부천시
 *   경기도 고양시 덕양구    → 고양시 덕양구
 * </pre>
 */
function shortRegionName(regionName) {
  const parts = String(regionName ?? '')
    .trim()
    .split(/\s+/)

  return parts.length > 1 ? parts.slice(1).join(' ') : parts.join(' ')
}

const goalTitle = computed(
  () =>
    `${shortRegionName(props.goal.regionName)} ${props.goal.housingType} ${props.goal.dealType}`,
)

// "2028-03" -> "2028년 3월 도달 예상" (API 응답 형식은 그대로 두고 표시 문구만 붙인다)
const etaLabel = computed(() => `${formatYearMonth(props.goal.targetDate)} 도달 예상`)
</script>

<template>
  <!-- "자세히"만 누를 수 있던 것을 카드 전체로 넓힌다. <a> 안에는 다른 <a>/<button>을
       중첩할 수 없어(중첩 시 브라우저가 파싱 단계에서 바깥 링크를 깨버린다), 안쪽에 있던
       두 RouterLink는 일반 텍스트로 바꾸고 카드 전체를 하나의 RouterLink로 감싼다. -->
  <RouterLink :to="`/goals/${goal.id}`" class="active-goal-card-link">
    <BaseCard class="active-goal-card">
      <div class="active-goal-card__top">
        <p class="active-goal-card__title">{{ goalTitle }}</p>
        <span class="active-goal-card__detail">자세히 ›</span>
      </div>

      <p class="active-goal-card__eta">{{ etaLabel }}</p>

      <div class="active-goal-card__row">
        <span class="active-goal-card__row-label">목표 금액</span>
        <strong class="active-goal-card__row-value">{{
          formatEokManwon(goal.targetAmount)
        }}</strong>
      </div>

      <div v-if="typeof monthlySaving === 'number'" class="active-goal-card__row">
        <span class="active-goal-card__row-label">월 저축액</span>
        <strong class="active-goal-card__row-value">{{ formatEokManwon(monthlySaving) }}</strong>
      </div>

      <BaseDivider class="active-goal-card__divider" />

      <p v-if="marketInsight" class="active-goal-card__insight">
        {{ marketInsight.prefix
        }}<strong class="active-goal-card__insight-emphasis">{{ marketInsight.emphasis }}</strong>
      </p>
    </BaseCard>
  </RouterLink>
</template>

<style scoped>
/* RouterLink 기본 스타일(밑줄·링크색)이 카드 안 텍스트로 새어 들어가지 않게 막는다.
   실제 색상은 각 텍스트 요소가 자기 스타일로 이미 정하고 있다. */
.active-goal-card-link {
  display: block;
  color: inherit;
  text-decoration: none;
}

.active-goal-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  /* BaseCard--lg 기본 20px 패딩 중 아래쪽만 줄인다 — 마지막 줄(시세 insight)과 카드
     하단 사이 여백이 다른 줄 간격보다 유독 넓어 보였다. TotalAssetCard와 같은 값. */
  padding-bottom: 12px;
  font-family: var(--sans-normal);
}

/* 제목과 '자세히'의 윗면을 같은 선에 맞춘다. 글자 크기 차가 커서 baseline/center로
   맞추면 '자세히' 쪽이 아래로 처져 보인다. */
.active-goal-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.active-goal-card__detail {
  flex: none;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-tertiary, #8f968c);
  text-decoration: none;
}

/* 이 카드에서 가장 먼저 읽혀야 하는 목표 제목이라 카드 안에서 제일 크게 둔다. */
.active-goal-card__title {
  overflow: hidden;
  margin: 0;
  font-size: 20px;
  font-weight: 900;
  color: var(--home-text-primary, #10130f);
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* "2028년 3월 도달 예상" — 목표 제목 바로 아래 보조 정보. */
.active-goal-card__eta {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-tertiary, #8f968c);
}

.active-goal-card__divider {
  margin: 10px 0 6px;
  background: var(--color-border, #262626);
}

.active-goal-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.active-goal-card__row-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-secondary, #9aa09a);
}

.active-goal-card__row-value {
  font-size: 16px;
  font-weight: 900;
  color: var(--home-text-primary, #10130f);
  font-variant-numeric: tabular-nums;
}

/* 문장 전체를 초록으로 강조하면 "초록색 긴 문장"처럼 읽혀서, 기본 문장은 secondary 톤으로
   낮추고 실제로 바뀌는 값(.insight-emphasis)만 primary green으로 강조한다. */
.active-goal-card__insight {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-tertiary, #8f968c);
  text-decoration: none;
}

.active-goal-card__insight-emphasis {
  font-weight: 700;
  color: var(--color-primary, #1d6b3f);
}
</style>
