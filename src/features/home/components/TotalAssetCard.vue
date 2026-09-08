<script setup>
import { computed } from 'vue'

import BaseCard from '@/shared/components/atoms/base/card/BaseCard.vue'
import BaseDivider from '@/shared/components/atoms/base/divider/BaseDivider.vue'
import BaseRefreshIcon from '@/shared/components/atoms/base/icon/BaseRefreshIcon.vue'
import { formatWon, formatDateTimeDot, formatEokManwon } from '@/shared/utils/formatter'

import assetIcon from '@/assets/images/assetIcon.png'

const props = defineProps({
  assetSummary: { type: Object, required: true },
  // 예적금/대출 세부 내역. 이전에는 AssetSummaryGrid가 별도 카드로 나열했지만, 흰 카드가
  // 반복되는 느낌을 줄이기 위해 이 카드 안에 row로 통합했다.
  assetBreakdown: { type: Object, required: true },
})

defineEmits(['refresh', 'view-detail'])

// 총자산은 세부 항목과 달리 "몇 원인지" 정확한 금액을 그대로 보여준다(만원 단위로 줄이지 않음).
const amount = computed(() => formatWon(props.assetSummary.totalAssets))
const syncedAt = computed(() => formatDateTimeDot(props.assetSummary.syncedAt))

// AssetSummaryGrid가 쓰던 것과 같은 두 항목·같은 sub 문구를 그대로 가져온다
// (대출 0원/보유 없음 — 실제 API가 뒷받침하는 문구만 사용한다). 고정 저축액은 자산
// 현황이라기보다 "목표를 위해 매달 얼마씩 모으는지"를 보여주는 목표 계획 정보에 가까워
// ActiveGoalCard의 "월 저축액" row로 옮겼다(같은 assetSummary.monthlySavings 값을 그쪽
// 컴포넌트에서 그대로 받아 쓴다).
// 금액은 억 단위가 넘어갈 수 있는 항목(특히 대출)도 있어 formatManwon 대신
// formatEokManwon으로 통일한다("1억 1,200만원"처럼 억+만원을 함께 표기).
const rows = computed(() => [
  {
    label: '예적금',
    amount: props.assetBreakdown.depositSavings.totalAmount,
    sub: `${props.assetBreakdown.depositSavings.accountCount}개 계좌`,
  },
  {
    label: '대출',
    amount: props.assetSummary.loanBalance,
    sub:
      props.assetBreakdown.loan.accountCount > 0
        ? `${props.assetBreakdown.loan.accountCount}개 계좌`
        : '보유 없음',
  },
])
</script>

<template>
  <!-- "자세히"만 누를 수 있던 것을 카드 전체로 넓힌다. 안에 새로고침 버튼처럼 별도
       동작을 하는 요소가 있어 RouterLink로 감싸는 대신 role="button"으로 클릭·키보드
       입력을 직접 받고, 실제 이동은 부모(HomeSummaryView)가 view-detail을 듣고 처리한다
       (이미 연결돼 있었지만 그동안 아무도 emit하지 않던 이벤트). -->
  <BaseCard
    class="total-asset-card"
    role="button"
    tabindex="0"
    @click="$emit('view-detail')"
    @keydown.enter="$emit('view-detail')"
    @keydown.space.prevent="$emit('view-detail')"
  >
    <div class="total-asset-card__top">
      <span class="total-asset-card__label">
        내 자산
        <img class="total-asset-card__label-icon" :src="assetIcon" alt="" />
      </span>
      <span class="total-asset-card__detail">자세히 ›</span>
    </div>

    <div class="total-asset-card__main">
      <p class="total-asset-card__amount">{{ amount }}</p>
    </div>

    <div class="total-asset-card__meta">
      <span class="total-asset-card__synced-at">{{ syncedAt }} 기준</span>
      <!-- 카드 전체가 클릭 가능해졌으니, 새로고침 버튼 클릭이 카드까지 버블링해서
           상세 화면으로 같이 넘어가 버리지 않도록 막는다 — 새로고침은 새로고침만 해야 한다. -->
      <button
        type="button"
        class="total-asset-card__refresh-btn"
        aria-label="자산 정보 갱신"
        @click.stop="$emit('refresh')"
      >
        <BaseRefreshIcon :size="14" bold />
      </button>
    </div>

    <BaseDivider class="total-asset-card__divider" />

    <div class="total-asset-card__rows">
      <div v-for="row in rows" :key="row.label" class="total-asset-card__row">
        <span class="total-asset-card__row-label">{{ row.label }}</span>
        <strong class="total-asset-card__row-value">{{ formatEokManwon(row.amount) }}</strong>
        <span class="total-asset-card__row-sub">{{ row.sub }}</span>
      </div>
    </div>
  </BaseCard>
</template>

<style scoped>
/*
  글자색 두 단계. 금액·라벨은 진하게, 보조 정보는 흐리게.
  opacity 대신 색을 직접 준다. 투명도로 흐리게 하면 배경색이 바뀔 때 같이 흔들린다.
  (main.css의 [data-theme] 블록에서 테마별 값을 정의한다.)
*/
.total-asset-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  /* BaseCard 기본 20px 패딩 중 아래쪽만 살짝 줄인다. */
  padding-bottom: 12px;
  background: var(--total-asset-surface, #f7ffd1);
  font-family: var(--sans-normal);
  letter-spacing: 0.02em;
  /*
    루트의 145%는 18px 기준으로 계산된 26.1px이 그대로 상속된다. 여기 글자는 12~28px이라
    줄 사이가 들쭉날쭉해진다. 단위 없는 값으로 덮어써야 각 글자 크기에 맞춰 계산된다.
  */
  line-height: 1.25;
  cursor: pointer;
}

.total-asset-card:focus-visible {
  outline: 2px solid var(--color-primary, #1d6b3f);
  outline-offset: 2px;
}

.total-asset-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* 카드 전체 gap을 4px로 좁혀서 금액 바로 아래 갱신 정보 줄을 붙였다.
     라벨 줄과 금액 줄 사이는 그만큼 여기서 다시 벌려준다. */
  margin-bottom: 8px;
}

.total-asset-card__label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 700;
  color: var(--total-asset-label, #12281c);
}

/* 픽셀 그림은 브라우저가 부드럽게 늘리면 뿌옇게 뭉갠다. 크기도 정수 배율로 맞춘다. */
.total-asset-card__label-icon {
  width: 12px;
  height: 12px;
  image-rendering: pixelated;
}

.total-asset-card__detail {
  font-size: 12px;
  font-weight: 700;
  color: var(--total-asset-detail, #8a8f63);
  text-decoration: none;
}

.total-asset-card__main {
  display: flex;
  align-items: center;
}

.total-asset-card__amount {
  margin: 0;
  font-size: 28px;
  line-height: 1.1;
  font-weight: 900;
  color: var(--home-ink-text, #12281c);
  font-variant-numeric: tabular-nums;
}

/* 갱신 시각(왼쪽)과 새로고침 아이콘(오른쪽)을 금액 아래 한 줄에 양 끝으로 배치한다.
   금액 줄과 살짝 더 떨어지도록 위쪽에 여백을 조금 더 준다. */
.total-asset-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.total-asset-card__synced-at {
  font-size: 11px;
  font-weight: 700;
  color: var(--total-asset-detail, #8a8f63);
}

/* 검정 pill 버튼 대신 아이콘만 노출한다. 보이는 크기는 캡션 줄에 맞춰 28px로 유지하고,
   실제 터치 영역만 ::before로 40px까지 넓혀 레이아웃에 영향 없이 탭하기 편하게 한다. */
.total-asset-card__refresh-btn {
  position: relative;
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 12px;
  background: none;
  color: var(--total-asset-label, #12281c);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.total-asset-card__refresh-btn::before {
  content: '';
  position: absolute;
  inset: -6px;
}

/* 카드 전체가 클릭 가능해졌으니, 이 버튼 위에 있을 때는 카드가 아니라 새로고침
   버튼만 반응한다는 걸 알 수 있게 자기 영역(원형)에만 회색 배경을 준다. */
.total-asset-card__refresh-btn:hover {
  background: rgba(0, 0, 0, 0.08);
}

.total-asset-card__divider {
  margin: 8px 0 10px;
  background: var(--color-border, #262626);
}

/*
  row끼리 같은 열 너비를 공유해야 금액 자릿수가 달라도(2,930만원 vs 1억 1,200만원) 오른쪽
  보조 정보 위치가 흔들리지 않는다. grid를 rows 컨테이너에 걸고, 각 row는 display:contents로
  박스를 없애 자신의 3개 자식이 그 grid에 직접 들어가게 한다(라벨/금액/보조정보 3열).
*/
.total-asset-card__rows {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: baseline;
  row-gap: 10px;
  column-gap: 8px;
}

.total-asset-card__row {
  display: contents;
}

.total-asset-card__row-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--total-asset-label, #12281c);
}

/* 금액이 이 카드에서 가장 중요한 정보라 보조 정보보다 진하게 두고, 열 안에서 오른쪽 정렬한다. */
.total-asset-card__row-value {
  font-size: 14px;
  font-weight: 900;
  color: var(--home-ink-text, #12281c);
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.total-asset-card__row-sub {
  font-size: 11px;
  font-weight: 700;
  color: var(--total-asset-detail, #8a8f63);
  text-align: right;
  white-space: nowrap;
}
</style>
