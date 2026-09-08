<script setup>
import { computed } from 'vue'

import BaseCard from '@/shared/components/atoms/base/card/BaseCard.vue'
import BaseDivider from '@/shared/components/atoms/base/divider/BaseDivider.vue'
import { toHousingViewModel } from '@/features/goal/utils/recommendationViewModel'

const props = defineProps({
  condition: { type: Object, required: true },
  // marketMedianAmount는 "현재" 시세가 아니라 이 시점 기준 예측값이라, 라벨에 반드시
  // 같이 표시해야 한다(recommendationViewModel.toHousingViewModel 참고).
  targetDate: { type: String, default: null },
})

const view = computed(() => toHousingViewModel(props.condition, props.targetDate))
</script>

<template>
  <BaseCard class="recommendation-housing-card">
    <p class="recommendation-housing-card__label">이런 집이에요</p>

    <p class="recommendation-housing-card__region">{{ view.regionName }}</p>
    <p class="recommendation-housing-card__type">{{ view.typeLine }} · {{ view.areaLine }}</p>

    <template v-if="view.marketMedianAmountLabel">
      <BaseDivider class="recommendation-housing-card__divider" />
      <p class="recommendation-housing-card__row-label">{{ view.marketMedianDateLabel }}</p>
      <p class="recommendation-housing-card__median">{{ view.marketMedianAmountLabel }}</p>
      <p v-if="view.sampleCountLabel" class="recommendation-housing-card__sample">
        {{ view.sampleCountLabel }}
      </p>
    </template>
  </BaseCard>
</template>

<style scoped>
.recommendation-housing-card {
  display: flex;
  flex-direction: column;
}

.recommendation-housing-card__label {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-secondary, #9aa09a);
}

.recommendation-housing-card__region {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 800;
  color: var(--color-text-primary, #ffffff);
}

/* 매물 유형 · 거래 유형 · 평수를 한 줄로 합친다(요청에 따라 면적을 별도 줄로 두지 않음).
   스타일은 기존 매물/거래 유형 톤을 그대로 쓴다. */
.recommendation-housing-card__type {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary, #ffffff);
}

/* BaseDivider 기본값은 테마를 안 타는 legacy 변수(--border)라 라이트 모드에서 너무 짙게
   보인다. 마이페이지(.my-page-view__row)와 같은 테마별 톤(--color-border)으로 맞춘다. */
.recommendation-housing-card__divider {
  margin: 16px 0 12px;
  background: var(--color-border, #262626);
}

.recommendation-housing-card__row-label {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary, #9aa09a);
}

.recommendation-housing-card__median {
  margin: 4px 0 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.recommendation-housing-card__sample {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--color-text-secondary, #9aa09a);
}
</style>
