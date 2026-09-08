<script setup>
import { computed, ref } from 'vue'

import {
  INCOME_BRACKET_BAND_LABEL,
  INCOME_BRACKET_LABEL,
  INCOME_BRACKET_ORDER,
  INCOME_BRACKET_SHORT_LABEL,
} from '@/shared/constants/compareDistribution'

import flagImage from '@/features/compare/assets/flag.png'

const MAX_SEGMENTS = 8

const props = defineProps({
  brackets: { type: Array, required: true },
  // 회원의 소득 분위(IncomeBracket enum, 예: INCOME_DECILE_2_3). 마이페이지에서 자기 신고로
  // 등록하는 값이라 금액에서 역산할 수 없어 그대로 전달받는다.
  myIncomeBracket: { type: String, default: null },
})

const orderedBrackets = computed(() =>
  [...props.brackets].sort(
    (a, b) => INCOME_BRACKET_ORDER.indexOf(a.bracket) - INCOME_BRACKET_ORDER.indexOf(b.bracket),
  ),
)

const maxRatio = computed(() => Math.max(...orderedBrackets.value.map((item) => item.ratio), 1))

const barItems = computed(() =>
  orderedBrackets.value.map((item) => ({
    key: item.bracket,
    label: INCOME_BRACKET_LABEL[item.bracket] ?? item.bracket,
    shortLabel: INCOME_BRACKET_SHORT_LABEL[item.bracket] ?? item.bracket,
    ratio: item.ratio,
    highlighted: item.bracket === props.myIncomeBracket,
    segmentCount: Math.max(1, Math.round((item.ratio / maxRatio.value) * MAX_SEGMENTS)),
  })),
)

const myBracket = computed(
  () => props.brackets.find((item) => item.bracket === props.myIncomeBracket) ?? null,
)

/** 소득이 실제로 기록된 구간. UNKNOWN은 값이 아니라 빈칸이라 뺀다. */
const knownBrackets = computed(() => props.brackets.filter((item) => item.bracket !== 'UNKNOWN'))

/**
 * 내 구간을 못 찾았을 때 왜 못 찾았는지.
 *
 * <p>원인이 두 가지인데 안내가 하나면 엉뚱한 곳으로 보내게 된다.
 * 내가 안 넣은 것과 또래가 안 넣은 것은 사용자가 할 수 있는 일이 다르다.
 */
const missReason = computed(() => {
  if (props.myIncomeBracket == null) return 'ME'
  if (knownBrackets.value.length === 0) return 'COHORT'
  return 'EMPTY_BAND'
})

const peopleOutOf10 = computed(() =>
  myBracket.value ? Math.max(1, Math.round(myBracket.value.ratio / 10)) : 0,
)

const myBandLabel = computed(() =>
  myBracket.value ? (INCOME_BRACKET_BAND_LABEL[myBracket.value.bracket] ?? '') : '',
)

const isHintOpen = ref(false)
</script>

<template>
  <div class="card" @click="isHintOpen = false">
    <p class="card__title">소득 구간 분포</p>

    <p v-if="myBracket" class="card__desc">
      또래 10명 중 <b>{{ peopleOutOf10 }}명</b>은 나와 같은 <b>{{ myBandLabel }}</b> 구간에 있어요!
    </p>
    <div v-else-if="missReason === 'ME'" class="card__hint-row">
      <span class="card__desc">내 위치를 보려면 소득 분위 정보가 필요해요</span>
      <button
        type="button"
        class="card__hint"
        aria-label="소득 분위 정보가 필요한 이유"
        @click.stop="isHintOpen = !isHintOpen"
      >
        ?
      </button>
      <div v-if="isHintOpen" class="tooltip" role="tooltip">
        마이페이지에서 소득 분위 정보를 등록하면 내 구간에 깃발을 꽂아드려요.
      </div>
    </div>
    <p v-else-if="missReason === 'COHORT'" class="card__desc">
      아직 또래의 소득 정보가 모이지 않았어요
    </p>
    <p v-else class="card__desc">
      내 소득 구간에는 아직 또래가 없어요.<br />전체 또래의 소득 분포를 보여드릴게요.
    </p>

    <div class="chart" :style="{ '--max-count': MAX_SEGMENTS }">
      <div
        v-for="(item, index) in barItems"
        :key="item.key"
        class="chart__col"
        :style="{ '--i': index }"
      >
        <div
          class="chart__bar"
          :class="{ 'chart__bar--highlight': item.highlighted }"
          :style="{ '--count': item.segmentCount }"
          :title="item.label"
        >
          <img v-if="item.highlighted" class="chart__flag" :src="flagImage" alt="내 구간" />
          <span class="chart__value">{{ item.ratio }}%</span>
        </div>
        <span class="chart__label">{{ item.shortLabel }}</span>
      </div>
    </div>
    <p class="chart__unit">단위: 만원</p>
  </div>
</template>

<style scoped>
.card {
  --ink: var(--c-ink);
  --ink-muted: var(--c-ink-muted);
  --mint: var(--c-accent);
  --bar-body: var(--c-accent-mid);
  --bar-line: var(--c-card);
  --bar-body-mine: var(--mint);
  --bar-line-mine: var(--c-card);

  border: 1px solid var(--c-line);
  border-radius: 14px;
  padding: 16px;
  background: var(--c-card);
  color: var(--ink);
  line-height: 1.45;
  animation: card-rise 0.35s ease-out both;
  animation-delay: 0.12s;
}

.card__title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
}

.card__desc {
  margin: 8px 0 0;
  font-size: 13px;
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
  margin-top: 8px;
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.tooltip::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 14px;
  border: 5px solid transparent;
  border-bottom-color: var(--c-tooltip-bg);
}

.chart {
  --segment: 8px;
  --segment-gap: 2px;

  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: calc(var(--max-count) * (var(--segment) + var(--segment-gap)) - var(--segment-gap));
  margin-top: 44px;
  overflow-x: auto;
}

.chart__col {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  min-width: 0;
  height: 100%;
}

.chart__bar {
  position: relative;
  width: 70%;
  height: calc(var(--count) * (var(--segment) + var(--segment-gap)) - var(--segment-gap));
  background: repeating-linear-gradient(
    to top,
    var(--bar-body) 0 var(--segment),
    var(--bar-line) var(--segment) calc(var(--segment) + var(--segment-gap))
  );
  transform-origin: bottom;
  animation: bar-grow 0.4s ease-out both;
  animation-delay: calc(var(--i, 0) * 60ms + 0.12s);
}

@keyframes bar-grow {
  from {
    transform: scaleY(0);
  }

  to {
    transform: scaleY(1);
  }
}

@keyframes value-fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes flag-drop-in {
  from {
    opacity: 0;
    transform: translate(-50%, -6px);
  }

  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

.chart__bar--highlight {
  background: repeating-linear-gradient(
    to top,
    var(--bar-body-mine) 0 var(--segment),
    var(--bar-line-mine) var(--segment) calc(var(--segment) + var(--segment-gap))
  );
}

.chart__flag {
  position: absolute;
  bottom: calc(100% + 17px);
  left: 50%;
  width: 14px;
  height: 14px;
  transform: translate(-50%, 0);
  image-rendering: pixelated;
  animation: flag-drop-in 0.3s ease-out both;
  animation-delay: calc(var(--i, 0) * 60ms + 0.68s);
}

.chart__value {
  position: absolute;
  bottom: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  font-size: 9.5px;
  white-space: nowrap;
  color: var(--ink-muted);
  font-variant-numeric: tabular-nums;
  animation: value-fade-in 0.25s ease-out both;
  animation-delay: calc(var(--i, 0) * 60ms + 0.52s);
}

.chart__label {
  overflow: hidden;
  max-width: 100%;
  margin-top: 6px;
  font-size: 9.5px;
  color: var(--ink-muted);
  text-align: center;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.chart__unit {
  margin: 4px 0 0;
  font-size: 10px;
  color: var(--ink-muted);
  text-align: right;
}
</style>
