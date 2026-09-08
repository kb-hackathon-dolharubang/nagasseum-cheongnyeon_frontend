<script setup>
import { computed } from 'vue'

import partyImage from '@/features/compare/assets/party.png'

const props = defineProps({
  cohortSize: { type: Number, required: true },
  assetRangeLabel: { type: String, required: true },
  ageRangeLabel: { type: String, required: true },
  /** 서버가 실제로 적용한 추가 필터. CompareCohort.appliedFilters 원본 그대로 */
  appliedFilters: { type: Array, default: () => [] },
})

defineEmits(['edit'])

const FILTER_LABELS = {
  INCOME: '소득',
  OCCUPATION: '직업군',
}

/**
 * 추가로 걸린 필터 칩.
 *
 * <p>자산·나이는 항상 걸리지만 소득·직업군은 요청에 넣어도 서버가 못 쓰는 경우가 있다.
 * 그래서 요청한 값이 아니라 서버가 "적용했다"고 돌려준 값을 그대로 보여준다.
 * 이게 없으면 대상이 0명일 때 필터 때문인지 진짜 또래가 없는 건지 알 수 없다.
 */
const extraChips = computed(() => props.appliedFilters.map((type) => FILTER_LABELS[type] ?? type))
</script>

<template>
  <section class="cohort-card">
    <div class="cohort-card__head">
      <h2 class="cohort-card__title">내 또래 기준</h2>
      <button type="button" class="cohort-card__edit" @click="$emit('edit')">기준 수정 ›</button>
    </div>

    <div class="cohort-card__chips">
      <span class="chip">{{ assetRangeLabel }}</span>
      <span class="chip">{{ ageRangeLabel }}</span>
      <span v-for="label in extraChips" :key="label" class="chip chip--extra"> + {{ label }} </span>
    </div>

    <p class="cohort-card__summary">
      <img class="cohort-card__icon" :src="partyImage" alt="" />
      <span
        ><b>{{ cohortSize.toLocaleString() }}명</b>의 파티원들과 비교 중</span
      >
    </p>
  </section>
</template>

<style scoped>
.cohort-card {
  --surface: var(--c-card);
  --chip-bg: var(--c-accent-soft);
  --chip-text: var(--c-ink);
  --mint: var(--c-accent);

  border: 1px solid var(--c-line);
  border-radius: 14px;
  padding: 16px;
  background: var(--surface);
  line-height: 1.45;
  animation: card-rise 0.35s ease-out both;
}

.cohort-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* main.css의 h1,h2가 흰색이라 밝은 카드에서 글자가 사라진다. 여기서 덮어쓴다. */
.cohort-card__title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--c-ink);
}

/*
  모양은 홈 화면의 "자세히 ›"와 같게 맞추고, 색은 본문색을 쓴다.
  --c-ink는 테마를 따라가므로 다크에서는 밝은 글씨가 된다.
*/
.cohort-card__edit {
  flex: none;
  border: 0;
  padding: 0;
  background: none;
  font-size: 13px;
  color: var(--c-ink);
  cursor: pointer;
}

.cohort-card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  margin-top: 8px;
}

.chip {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 3px 10px;
  background: var(--chip-bg);
  font-size: 12px;
  font-weight: 700;
  color: var(--chip-text);
}

/*
  추가 필터는 기본 조건과 구분되게 테두리만 준다. 같은 모양이면 자산·나이처럼
  항상 걸리는 조건으로 오해한다.
*/
.chip--extra {
  border: 1px solid var(--mint);
  background: none;
  color: var(--mint);
}

.cohort-card__summary {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 0 0;
  border: 1px solid var(--c-line);
  border-radius: 14px;
  padding: 7px 12px;
  background: var(--c-box);
  font-size: 13px;
  color: var(--mint);
}

.cohort-card__icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  image-rendering: pixelated;
}

.cohort-card__summary b {
  font-weight: 700;
}
</style>
