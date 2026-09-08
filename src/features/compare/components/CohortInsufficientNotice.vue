<script setup>
import { computed } from 'vue'

import StateNoticeCard from '@/features/compare/components/StateNoticeCard.vue'

const props = defineProps({
  /** 인원 부족일 때 서버가 null을 주기도 한다. 그때는 0명으로 본다 */
  cohortSize: { type: Number, default: 0 },
  minimumRequired: { type: Number, required: true },
  canWiden: { type: Boolean, required: true },
  /** 서버가 실제로 적용한 추가 필터. CompareCohort.appliedFilters 원본 그대로 */
  appliedFilters: { type: Array, default: () => [] },
})

defineEmits(['widen'])

const FILTER_LABELS = {
  INCOME: '소득',
  OCCUPATION: '직업군',
}

const size = computed(() => props.cohortSize ?? 0)

const gaugeWidth = computed(() => `${Math.min(100, (size.value / props.minimumRequired) * 100)}%`)

/**
 * 지금 걸려 있는 추가 조건.
 *
 * <p>인원이 0명일 때 필터 때문인지 진짜 또래가 없는 건지 화면만 봐서는 알 수 없다.
 * 소득·직업군은 값이 없는 사람을 전부 걸러내서 혼자 0명을 만들 수 있다.
 */
const extraLabels = computed(() => props.appliedFilters.map((type) => FILTER_LABELS[type] ?? type))
</script>

<template>
  <StateNoticeCard eyebrow="집계 대기" title="아직 비교 데이터가 부족합니다">
    같은 자산·나이 범위의 또래가 {{ size }}명뿐이에요. 최소 {{ minimumRequired }}명이 모이면 정확한
    비교 결과를 보여드릴게요.
    <div class="gauge">
      <span class="gauge__track">
        <span class="gauge__fill" :style="{ width: gaugeWidth }"></span>
      </span>
      <span class="gauge__label">{{ size }} / {{ minimumRequired }}명</span>
    </div>

    <p v-if="extraLabels.length" class="applied">
      지금 <b>{{ extraLabels.join(' · ') }}</b> 조건이 함께 걸려 있어요
    </p>

    <template #action>
      <button type="button" class="state-card__cta state-card__cta--button" @click="$emit('widen')">
        {{ canWiden ? '비교 범위 넓히기' : '비교 기준 수정하기' }}
      </button>
      <p v-if="!canWiden" class="state-card__hint">
        자산·나이 범위를 가장 넓게 잡아도 또래가 모이지 않았어요.<br />추가 조건을 해제하면 도움이
        될 수 있어요.
      </p>
    </template>
  </StateNoticeCard>
</template>

<style scoped>
/* 추가 조건이 걸려 있을 때만 나온다. 인원이 적은 이유를 먼저 알려주는 줄이다. */
.applied {
  margin: 9px 0 0;
  font-size: 11.5px;
  color: var(--c-ink-muted);
}

.applied b {
  font-weight: 700;
  color: var(--c-accent);
}

.gauge {
  margin-top: 11px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.gauge__track {
  flex: 1;
  height: 6px;
  background: var(--c-track);
  overflow: hidden;
}

.gauge__fill {
  display: block;
  height: 100%;
  background: var(--c-accent);
}

.gauge__label {
  font-size: 10.5px;
  color: var(--c-ink-muted);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.state-card__cta {
  margin-top: 12px;
  display: inline-flex;
  align-items: center;
  padding: 8px 15px;
  border-radius: 999px;
  background: var(--c-accent);
  color: var(--c-on-accent);
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
}

.state-card__cta--button {
  border: 0;
  font-family: inherit;
  cursor: pointer;
}

.state-card__hint {
  margin: 12px 0 0;
  font-size: 11px;
  line-height: 1.6;
  color: var(--c-ink-muted);
  opacity: 0.75;
}
</style>
