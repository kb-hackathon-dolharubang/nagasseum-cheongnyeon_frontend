<script setup>
const SEGMENT_COUNT = 10

defineProps({
  policies: { type: Array, required: true },
})

const filledCount = (ratio) => Math.round((ratio / 100) * SEGMENT_COUNT)
</script>

<template>
  <div class="card">
    <p class="card__title">또래가 많이 받은 정책 · TOP {{ policies.length }}</p>
    <div class="policy-list">
      <div v-for="policy in policies" :key="policy.rank" class="policy-row">
        <span class="policy-row__rank" :class="`policy-row__rank--${Math.min(policy.rank, 3)}`">
          {{ policy.rank }}
        </span>
        <span class="policy-row__name">{{ policy.policyName }}</span>
        <span
          class="policy-row__track"
          :class="{ 'policy-row__track--top': policy.rank === 1 }"
          aria-hidden="true"
        >
          <span
            v-for="n in SEGMENT_COUNT"
            :key="n"
            class="policy-row__segment"
            :class="{ 'policy-row__segment--on': n <= filledCount(policy.benefitRatio) }"
          ></span>
        </span>
        <span class="policy-row__value">{{ policy.benefitRatio }}%</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  --ink: var(--c-ink);
  --ink-muted: var(--c-ink-muted);
  --mint: var(--c-accent);
  --mint-soft: var(--c-accent-mid);
  --segment: var(--c-track);
  --rank-1: #ffd939;
  --rank-2: #c9d1d3;
  --rank-3: #d99a5b;
  --rank-ink: #16281c;

  border: 1px solid var(--c-line);
  border-radius: 14px;
  padding: 16px;
  background: var(--c-card);
  color: var(--ink);
  line-height: 1.45;
  animation: card-rise 0.35s ease-out both;
  animation-delay: 0.28s;
}

.card__title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
}

.policy-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 12px;
}

.policy-row {
  display: grid;
  grid-template-columns: 24px 1fr auto;
  grid-template-rows: auto auto;
  align-items: center;
  column-gap: 10px;
  row-gap: 6px;
}

.policy-row__rank {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 7px;
  color: var(--rank-ink);
  font-size: 12px;
  font-weight: 700;
  grid-row: 1 / 3;
}

.policy-row__rank--1 {
  background: var(--rank-1);
}

.policy-row__rank--2 {
  background: var(--rank-2);
}

.policy-row__rank--3 {
  background: var(--rank-3);
}

.policy-row__name {
  color: var(--ink);
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  grid-column: 2 / 4;
}

.policy-row__track {
  display: flex;
  gap: 3px;
  grid-column: 2 / 3;
}

.policy-row__segment {
  flex: 1;
  height: 9px;
  border-radius: 3px;
  background: var(--segment);
}

.policy-row__segment--on {
  background: var(--mint-soft);
}

.policy-row__track--top .policy-row__segment--on {
  background: var(--mint);
}

.policy-row__value {
  color: var(--ink-muted);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  grid-column: 3 / 4;
}
</style>
