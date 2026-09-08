<script setup>
import { computed, ref } from 'vue'

import { OCCUPATION_LABEL } from '@/shared/constants/occupation'

import SegmentBarList from '@/features/compare/components/SegmentBarList.vue'

const props = defineProps({
  /** AssetCompareResponse.occupationDistribution 원본 ({ occupationType, ratio }) */
  items: { type: Array, required: true },
  /** 내 직업군. 미입력이면 null */
  myOccupationType: { type: String, default: null },
})

/**
 * 비율 높은 순으로 정렬하되 '미입력'은 항상 맨 아래.
 *
 * <p>서버가 직업군을 안 넣은 사람들을 UNKNOWN 한 덩어리로 묶어 보내준다. 비율이 커도
 * 정보가 아니라 빈칸이라서 위로 올라오면 안 된다.
 */
const sorted = computed(() =>
  [...props.items].sort((a, b) => {
    if (a.occupationType === 'UNKNOWN') return 1
    if (b.occupationType === 'UNKNOWN') return -1
    return b.ratio - a.ratio
  }),
)

/** 미입력을 뺀 1위. 상단 문구용이라 빈칸이 1위가 되면 안 된다. */
const topItem = computed(
  () => sorted.value.find((item) => item.occupationType !== 'UNKNOWN') ?? null,
)

const myItem = computed(() =>
  props.myOccupationType
    ? (sorted.value.find((item) => item.occupationType === props.myOccupationType) ?? null)
    : null,
)

const barItems = computed(() =>
  sorted.value.map((item) => {
    const isMine = item.occupationType === props.myOccupationType
    const isTop = topItem.value != null && item.occupationType === topItem.value.occupationType
    return {
      key: item.occupationType,
      label: OCCUPATION_LABEL[item.occupationType] ?? item.occupationType,
      ratio: item.ratio,
      // 내 직업군 표시가 1위 표시보다 우선한다. 둘 다 붙일 자리가 없다.
      badge: isMine ? '나' : isTop ? '1위' : null,
      highlighted: isMine || (myItem.value == null && isTop),
    }
  }),
)

/** 직업군이 실제로 기록된 항목. UNKNOWN은 값이 아니라 빈칸이라 뺀다. */
const knownItems = computed(() => props.items.filter((item) => item.occupationType !== 'UNKNOWN'))

/**
 * 내 직업군을 못 찾았을 때 왜 못 찾았는지.
 *
 * <p>내가 안 넣은 것과 또래가 안 넣은 것은 사용자가 할 수 있는 일이 다르다.
 * 안내가 하나면 엉뚱한 곳으로 보내게 된다.
 */
const missReason = computed(() => {
  if (props.myOccupationType == null) return 'ME'
  if (knownItems.value.length === 0) return 'COHORT'
  return 'EMPTY_BAND'
})

const isHintOpen = ref(false)

const topLabel = computed(() =>
  topItem.value
    ? (OCCUPATION_LABEL[topItem.value.occupationType] ?? topItem.value.occupationType)
    : '',
)
</script>

<template>
  <div class="card" @click="isHintOpen = false">
    <p class="card__title">직업군 분포</p>

    <p v-if="myItem" class="card__desc">
      나와 같은 <b>{{ OCCUPATION_LABEL[myOccupationType] ?? myOccupationType }}</b
      >은 또래의 <b>{{ myItem.ratio }}%</b>예요
    </p>
    <div v-else-if="missReason === 'ME'" class="card__hint-row">
      <span class="card__desc">내 위치를 보려면 직업군 정보가 필요해요</span>
      <button
        type="button"
        class="card__hint"
        aria-label="직업군 정보가 필요한 이유"
        @click.stop="isHintOpen = !isHintOpen"
      >
        ?
      </button>
      <div v-if="isHintOpen" class="tooltip" role="tooltip">
        마이페이지에서 직업군을 등록하면 내 직업군이 또래 중 몇 %인지 알려드려요.
      </div>
    </div>
    <p v-else-if="missReason === 'COHORT'" class="card__desc">
      아직 또래의 직업군 정보가 모이지 않았어요
    </p>
    <p v-else class="card__desc">
      나와 같은 직업군의 또래는 아직 없어요.<br />
      전체 또래 중에서는 <b>{{ topLabel }}({{ topItem.ratio }}%)</b>이 가장 많아요.
    </p>

    <SegmentBarList :items="barItems" fill-mode="max" />
  </div>
</template>

<style scoped>
.card {
  --ink: var(--c-ink);
  --ink-muted: var(--c-ink-muted);
  --mint: var(--c-accent);
  --segment: var(--c-track);
  --segment-on: var(--c-accent-mid);
  --segment-on-highlight: var(--mint);
  --badge: var(--c-badge-bg);

  border: 1px solid var(--c-line);
  border-radius: 14px;
  padding: 16px;
  background: var(--c-card);
  color: var(--ink);
  line-height: 1.45;
  animation: card-rise 0.35s ease-out both;
  animation-delay: 0.18s;
}

.card__title {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 700;
}

.card__desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--ink-muted);
}

.card__desc b {
  font-weight: 700;
  color: var(--mint);
}

.card__hint-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 5px;
}

.card__hint-row .card__desc {
  margin: 0;
}

.card__hint {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 13px;
  height: 13px;
  margin: 0;
  padding: 0;
  border: 1px solid var(--ink-muted);
  border-radius: 50%;
  background: none;
  color: var(--ink-muted);
  font-size: 9px;
  line-height: 1;
  cursor: pointer;
}

.tooltip {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 1;
  width: max-content;
  max-width: 220px;
  padding: 8px 10px;
  border-radius: 8px;
  background: var(--c-tooltip-bg);
  color: #f0f2ef;
  font-size: 11px;
  line-height: 1.4;
}
</style>
