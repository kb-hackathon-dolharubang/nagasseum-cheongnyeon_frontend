<script setup>
const SEGMENT_COUNT = 10

defineProps({
  regions: { type: Array, required: true },
})

const filledCount = (ratio) => Math.round((ratio / 100) * SEGMENT_COUNT)
</script>

<template>
  <div class="card">
    <p class="card__title">인기 목표 지역 순위 · TOP 3</p>
    <div class="region-list">
      <div v-for="region in regions" :key="region.rank" class="region-row">
        <span class="region-row__rank" :class="`region-row__rank--${region.rank}`">
          {{ region.rank }}
        </span>
        <span class="region-row__name">{{ region.regionName }}</span>
        <span
          class="region-row__track"
          :class="{ 'region-row__track--top': region.rank === 1 }"
          aria-hidden="true"
        >
          <span
            v-for="n in SEGMENT_COUNT"
            :key="n"
            class="region-row__segment"
            :class="{ 'region-row__segment--on': n <= filledCount(region.ratio) }"
          ></span>
        </span>
        <span class="region-row__value">{{ region.ratio }}%</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 폰트 크기는 rem이 아닌 px로 고정한다.
   루트가 18px/16px로 바뀌면 픽셀 폰트가 그리드에서 어긋나 뭉개진다. */
.card {
  --ink: var(--c-ink);
  --ink-muted: var(--c-ink-muted);
  --mint: var(--c-accent);
  --mint-soft: var(--c-accent-mid);
  --segment: var(--c-track);
  /*
    순위 배지는 금·은·동. 메달 색이라 테마를 타지 않고 라이트·다크 모두 같은 값을 쓴다.
    셋 다 밝은 색이라 숫자는 진한 초록으로 고정한다.
  */
  --rank-1: #ffd939;
  --rank-2: #c9d1d3;
  --rank-3: #d99a5b;
  --rank-ink: #16281c;

  border: 1px solid var(--c-line);
  border-radius: 14px;
  padding: 16px;
  background: var(--c-card);
  color: var(--ink);
  /* 루트의 145%는 18px 기준으로 계산된 26.1px이 그대로 상속된다.
     단위 없는 값으로 덮어써야 각 요소가 제 폰트 크기로 줄 높이를 계산한다. */
  line-height: 1.45;
  animation: card-rise 0.35s ease-out both;
  animation-delay: 0.24s;
}

.card__title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
}

.region-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 12px;
}

/* 지역명 칸을 고정해야 행마다 게이지 시작 위치가 맞는다. */
.region-row {
  display: grid;
  grid-template-columns: 24px 76px 1fr auto;
  align-items: center;
  gap: 12px;
}

.region-row__rank {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 7px;
  color: var(--rank-ink);
  font-size: 12px;
  font-weight: 700;
}

.region-row__rank--1 {
  background: var(--rank-1);
}

.region-row__rank--2 {
  background: var(--rank-2);
}

.region-row__rank--3 {
  background: var(--rank-3);
}

/*
  지역명은 이 줄의 주인공이라 굵게, 오른쪽 비율은 보조색 보통 굵기로 둔다.
  둘 다 같은 무게면 어느 쪽이 이름이고 어느 쪽이 값인지 구분이 안 된다.
*/
.region-row__name {
  color: var(--ink);
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.region-row__track {
  display: flex;
  gap: 3px;
}

.region-row__segment {
  flex: 1;
  height: 9px;
  border-radius: 3px;
  background: var(--segment);
}

.region-row__segment--on {
  background: var(--mint-soft);
}

.region-row__track--top .region-row__segment--on {
  background: var(--mint);
}

.region-row__value {
  color: var(--ink-muted);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}
</style>
