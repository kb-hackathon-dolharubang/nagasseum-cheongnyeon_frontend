<script setup>
import BaseCard from '@/shared/components/atoms/base/card/BaseCard.vue'

defineProps({
  title: { type: String, required: true },
  // 두 형태를 지원한다:
  // - { fromLabel, fromValue, toLabel, toValue } — 좌우 값의 의미가 서로 달라(예:
  //   PREFERENCE_SAVING_FIXED의 "월 저축 → 예상 도달 시점") 양쪽에 각자 label이 필요한 경우.
  // - { key, label, fromValue, toValue } — 같은 항목이 어떻게 바뀌었는지 보여주는 경우(예:
  //   HOLD_OUT의 "면적: 4~9평 → 10~14평"). label 하나를 box 위에 한 번만 두고, 카드
  //   제목과 겹치는 "현재 준비 상황 반영"/"선택의 폭 확대" 같은 문구는 반복하지 않는다.
  // 호출부(toCompareCardViewModel)가 이미 표시 가능 여부를 판단하므로 이 컴포넌트는
  // 항상 값이 있다고 가정한다.
  rows: { type: Array, required: true },
})
</script>

<template>
  <BaseCard class="recommendation-compare-card">
    <p class="recommendation-compare-card__label">{{ title }}</p>

    <div
      v-for="(row, index) in rows"
      :key="row.key ?? row.label ?? row.fromLabel ?? index"
      class="recommendation-compare-card__item"
    >
      <p v-if="row.label" class="recommendation-compare-card__item-label">{{ row.label }}</p>

      <div class="recommendation-compare-card__compare">
        <div class="recommendation-compare-card__compare-box">
          <span v-if="row.fromLabel" class="recommendation-compare-card__row-label">{{
            row.fromLabel
          }}</span>
          <strong class="recommendation-compare-card__row-value">{{ row.fromValue }}</strong>
        </div>
        <span class="recommendation-compare-card__compare-arrow">→</span>
        <div class="recommendation-compare-card__compare-box">
          <span v-if="row.toLabel" class="recommendation-compare-card__row-label">{{
            row.toLabel
          }}</span>
          <strong
            class="recommendation-compare-card__row-value recommendation-compare-card__row-value--emphasis"
            >{{ row.toValue }}</strong
          >
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<style scoped>
.recommendation-compare-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recommendation-compare-card__label {
  margin: 0 0 2px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-secondary, #9aa09a);
}

/* row가 여러 개일 때(예: HOLD_OUT의 면적/실거래 중앙값) box 위에 항목명을 한 번만
   두기 위한 wrapper. item끼리는 카드 기본 gap(8px)만으로 충분히 구분된다. */
.recommendation-compare-card__item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.recommendation-compare-card__item-label {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary, #9aa09a);
}

/*
  목표 상세 화면의 매물 시세 변화 카드(MarketPriceAlertCard의 "유지 시 → 반영 시" 비교 패널)와
  같은 구조를 재사용한다 — 배경 박스 안에 두 값을 나란히 두고 화살표로 잇는다. 다만 거기서는
  "반영 시" 값을 --color-primary(초록)로 강조하는데, 여기서는 시점이 늦어지거나 더 준비해야
  하는 값일 수도 있어 긍정적 강조색을 새로 쓰지 않고 font-weight 차이로만 구분한다.
*/
.recommendation-compare-card__compare {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: var(--color-app-bg, #111111);
  border-radius: 10px;
}

.recommendation-compare-card__compare-box {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
}

/* 값 두 개를 잇는 화살표라 너무 흐리면 "비교하고 있다"는 느낌이 옅어진다 — muted
   secondary 대신 primary 톤을 써서 존재감을 살짝 올린다(크기는 그대로). */
.recommendation-compare-card__compare-arrow {
  flex-shrink: 0;
  font-size: 13px;
  color: var(--color-text-primary, #ffffff);
}

/* label은 값보다 한 단계 약하게 — "50만 원"/"2051년 8월"을 먼저 읽고 label은 그 값이
   무엇인지 확인할 때만 보조로 읽히면 된다. */
.recommendation-compare-card__row-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary, #9aa09a);
}

/* 새 색상을 쓰지 않고 두 값 모두 primary 텍스트 톤을 쓰되, font-size는 같게 두고
   font-weight 한 단계 차이만으로 "계산 결과"(--emphasis)를 구분한다. */
.recommendation-compare-card__row-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.recommendation-compare-card__row-value--emphasis {
  font-weight: 800;
}
</style>
