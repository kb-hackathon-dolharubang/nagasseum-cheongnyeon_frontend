<script setup>
import { computed } from 'vue'

import BaseCard from '@/shared/components/atoms/base/card/BaseCard.vue'
import BaseDivider from '@/shared/components/atoms/base/divider/BaseDivider.vue'
import { toFundingViewModel } from '@/features/goal/utils/recommendationViewModel'

const props = defineProps({
  loanX: { type: Object, required: true },
  // 대출 활용 플랜이 없는 recommendation도 있을 수 있어 필수값이 아니다. 이때는 "대출 활용
  // 시" 컬럼과 하단 강조 문구 없이 왼쪽(대출 없이) 값만 보여준다.
  loanO: { type: Object, default: null },
  // 대출 효과 문구가 PREFERENCE_DATE_FIXED만 다르게 계산돼(기간 단축이 아니라 월 저축
  // 감소) 필요하다.
  type: { type: String, default: null },
})

const view = computed(() =>
  toFundingViewModel({ type: props.type, loanX: props.loanX, loanO: props.loanO }),
)
</script>

<template>
  <BaseCard class="recommendation-funding-card">
    <p class="recommendation-funding-card__label">이 목표를 준비하려면</p>

    <div
      class="recommendation-funding-card__table"
      :class="{ 'recommendation-funding-card__table--with-loan': view.hasLoan }"
    >
      <template v-if="view.hasLoan">
        <div class="recommendation-funding-card__row recommendation-funding-card__row--header">
          <span class="recommendation-funding-card__header-cell" />
          <span class="recommendation-funding-card__header-cell">대출 없이</span>
          <span class="recommendation-funding-card__header-cell">대출 활용 시</span>
        </div>

        <BaseDivider class="recommendation-funding-card__divider" />
      </template>

      <div
        v-for="row in view.rows"
        :key="row.label"
        class="recommendation-funding-card__row"
        :class="{ 'recommendation-funding-card__row--muted': row.muted }"
      >
        <span class="recommendation-funding-card__row-label">{{ row.label }}</span>
        <template v-if="view.hasLoan && row.isSame">
          <span
            class="recommendation-funding-card__row-value recommendation-funding-card__row-value--common"
            >{{ row.common }}</span
          >
        </template>
        <template v-else>
          <span class="recommendation-funding-card__row-value">{{ row.withoutLoan }}</span>
          <span
            v-if="view.hasLoan"
            class="recommendation-funding-card__row-value"
            :class="{ 'recommendation-funding-card__row-value--emphasized': !row.muted }"
            >{{ row.withLoan }}</span
          >
        </template>
      </div>
    </div>

    <p v-if="view.highlight" class="recommendation-funding-card__highlight">
      {{ view.highlight.prefix }}
      <strong class="recommendation-funding-card__highlight-emphasis">{{
        view.highlight.emphasis
      }}</strong>
      {{ view.highlight.suffix }}
    </p>

    <p class="recommendation-funding-card__note">
      실제 대출 가능 금액은 금융기관 심사 결과에 따라 달라질 수 있어요.
    </p>
  </BaseCard>
</template>

<style scoped>
.recommendation-funding-card {
  display: flex;
  flex-direction: column;
}

.recommendation-funding-card__label {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-secondary, #9aa09a);
}

.recommendation-funding-card__table {
  display: flex;
  flex-direction: column;
}

/*
  PREFERENCE/REALISTIC/HOLD_OUT 상세 화면 모두 같은 좌우 비교 구조를 쓴다 — 행(직접 준비할
  금액/예상 대출 금액/월 저축/예상 도달 시점) 순서와 컬럼 위치를 고정해, recommendation
  종류가 달라져도 표를 새로 해석할 필요가 없게 한다. loanO가 없으면(hasLoan=false) 오른쪽
  "대출 활용 시" 컬럼 자체가 없어 2열로 줄어든다.
*/
.recommendation-funding-card__row {
  display: grid;
  grid-template-columns: 90px 1fr;
  align-items: baseline;
  gap: 8px;
  padding: 9px 0;
}

.recommendation-funding-card__table--with-loan .recommendation-funding-card__row {
  grid-template-columns: 90px 1fr 1fr;
}

/* row끼리의 인접 형제로만 판단해 행 사이 경계에만 선이 그어지게 한다 — 헤더 아래 이미
   BaseDivider가 있어 첫 데이터 행 위에는 겹쳐 그려지지 않는다. */
.recommendation-funding-card__row + .recommendation-funding-card__row {
  border-top: 1px solid var(--color-border, #262626);
}

.recommendation-funding-card__row--header {
  padding-bottom: 2px;
}

/* 값 두 컬럼 위에 붙는 작은 컬럼 제목. row-label과 같은 톤이되, "표 헤더"로 읽히도록
   가운데 정렬해 그 아래 값들과 시각적으로 묶는다. */
.recommendation-funding-card__header-cell {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-secondary, #9aa09a);
  text-align: center;
}

/* BaseDivider 기본값은 테마를 안 타는 legacy 변수(--border)라 라이트 모드에서 너무 짙게
   보인다. 마이페이지(.my-page-view__row)와 같은 테마별 톤(--color-border)으로 맞춘다. */
.recommendation-funding-card__divider {
  margin: 2px 0 0;
  background: var(--color-border, #262626);
}

/* 좌우 비교가 핵심이라 라벨은 연하게 두고 값만 진하게 대비를 준다. */
.recommendation-funding-card__row-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary, #9aa09a);
}

.recommendation-funding-card__row-value {
  overflow: hidden;
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 대출 없이/활용 시 값이 같은 row는 두 값 컬럼을 반복하지 않고 하나로 합쳐, 그 합친
   영역(두 값 컬럼 폭) 가운데에 값을 한 번만 둔다. row 높이·divider·label 위치는
   다른 row와 동일하게 유지된다 — value 영역만 병합될 뿐이다. */
.recommendation-funding-card__row-value--common {
  grid-column: 2 / span 2;
}

/* 대출을 활용했을 때 실제로 달라지는 결과(오른쪽 값)만 한 단계 더 굵게 — 새 색상 없이
   font-weight만으로 "이게 핵심 변화다"를 드러낸다. */
.recommendation-funding-card__row-value--emphasized {
  font-weight: 800;
}

/* "예상 대출 금액"은 결과가 아니라 다른 row가 달라지는 원인이 되는 조건이라, 굵기를
   기본값보다 한 단계 낮춰 다른 row보다 보조적으로 보이게 한다. */
.recommendation-funding-card__row--muted .recommendation-funding-card__row-value {
  font-weight: 600;
}

.recommendation-funding-card__highlight {
  margin: 14px 0 0;
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--color-primary-soft, #e8f4ea);
  color: #353934;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
}

/* 강조 box 안에서도 핵심 숫자가 가장 먼저 읽혀야 해서, 그 부분만 한 단계 더 굵게 한다.
   새 색상/배경 없이 font-weight만으로 구분한다. */
.recommendation-funding-card__highlight-emphasis {
  font-weight: 800;
}

.recommendation-funding-card__note {
  margin: 10px 0 0;
  font-size: 12px;
  color: var(--color-text-secondary, #9aa09a);
}
</style>
