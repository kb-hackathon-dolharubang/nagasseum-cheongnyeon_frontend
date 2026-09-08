<script setup>
import { ref, watch } from 'vue'

import { formatEokManwon } from '@/shared/utils/formatter'

const COUNT_UP_MS = 600

const props = defineProps({
  cohortAverageNetAssets: { type: Number, required: true },
})

// 숫자가 0에서 실제 값까지 올라가는 효과. 탭 전환으로 다시 마운트될 때도,
// 코호트 필터를 바꿔 같은 카드에서 값만 바뀔 때도 매번 새로 세어 올라간다.
const displayValue = ref(0)
let rafId = null

function countUpTo(target) {
  // 애니메이션이 끝나기 전에 값이 또 바뀌면(예: 필터 재적용) 이전 rAF 루프가
  // 남아 새 루프와 동시에 displayValue를 덮어써 숫자가 튀는 문제가 있어 취소한다.
  if (rafId != null) cancelAnimationFrame(rafId)

  const from = displayValue.value
  const start = performance.now()

  function tick(now) {
    const progress = Math.min(1, (now - start) / COUNT_UP_MS)
    const eased = 1 - (1 - progress) ** 2
    displayValue.value = Math.round(from + (target - from) * eased)
    rafId = progress < 1 ? requestAnimationFrame(tick) : null
  }

  rafId = requestAnimationFrame(tick)
}

watch(() => props.cohortAverageNetAssets, countUpTo, { immediate: true })
</script>

<template>
  <div class="card">
    <p class="card__title">나와 비슷한 사람들은 이만큼 모았어요</p>
    <p class="card__value">{{ formatEokManwon(displayValue) }}</p>
    <p class="card__desc">비슷한 자산·나이대 사람들의 평균 순자산이에요</p>
  </div>
</template>

<style scoped>
.card {
  --ink: var(--c-ink);
  --ink-muted: var(--c-ink-muted);

  border: 1px solid var(--c-line);
  border-radius: 14px;
  padding: 16px;
  background: var(--c-card);
  color: var(--ink);
  line-height: 1.45;
  animation: card-rise 0.35s ease-out both;
  animation-delay: 0.06s;
}

.card__title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
}

.card__value {
  margin: 8px 0 0;
  font-size: 26px;
  font-weight: 700;
  color: var(--c-value);
  font-variant-numeric: tabular-nums;
}

.card__desc {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--ink-muted);
}
</style>
