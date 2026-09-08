<script setup>
import { computed } from 'vue'

const SEGMENT_COUNT = 10

const props = defineProps({
  items: { type: Array, required: true },
  /**
   * 막대 길이 기준.
   *
   * <p>'absolute'는 100%가 10칸이다. 항목이 두세 개라 한쪽이 과반을 넘는 분포에 맞다.
   * 'max'는 1위가 10칸이고 나머지는 그에 비례한다. 항목이 많아 전부 20% 아래로
   * 깔리는 분포에서는 이쪽이라야 차이가 보인다. 옆에 실제 %를 같이 적어둔다.
   */
  fillMode: { type: String, default: 'absolute' },
})

const maxRatio = computed(() => Math.max(...props.items.map((item) => item.ratio), 0))

const rows = computed(() => {
  const base = props.fillMode === 'max' && maxRatio.value > 0 ? maxRatio.value : 100
  return props.items.map((item) => ({
    ...item,
    // 0%가 아니면 최소 한 칸은 채운다. 있는데 안 보이면 없는 것으로 읽힌다.
    filled: item.ratio > 0 ? Math.max(1, Math.round((item.ratio / base) * SEGMENT_COUNT)) : 0,
  }))
})
</script>

<template>
  <div class="bar-list">
    <div
      v-for="(item, rowIndex) in rows"
      :key="item.key"
      class="bar-row"
      :style="{ '--row': rowIndex }"
    >
      <div class="bar-row__head">
        <span class="bar-row__label">{{ item.label }}</span>
        <span v-if="item.badge" class="bar-row__badge">{{ item.badge }}</span>
        <span class="bar-row__value">{{ item.ratio }}%</span>
      </div>
      <div
        class="bar-row__track"
        :class="{ 'bar-row__track--highlight': item.highlighted }"
        aria-hidden="true"
      >
        <span
          v-for="n in SEGMENT_COUNT"
          :key="n"
          class="bar-row__segment"
          :class="{ 'bar-row__segment--on': n <= item.filled }"
          :style="{ '--i': n }"
        ></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bar-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
}

.bar-row__head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.bar-row__badge {
  display: inline-flex;
  align-items: center;
  height: 12px;
  border-radius: 999px;
  padding: 0 5px;
  background: var(--badge, var(--c-badge-bg));
  color: var(--c-badge-ink);
  font-size: 10px;
  line-height: 1;
}

.bar-row__value {
  margin-left: auto;
  font-variant-numeric: tabular-nums;
}

.bar-row__track {
  display: flex;
  gap: 3px;
  margin-top: 4px;
}

.bar-row__segment {
  flex: 1;
  height: 12px;
  border-radius: 3px;
  background: var(--segment);
}

.bar-row__segment--on {
  background: var(--segment-on);
  animation: segment-rise 0.26s ease-out both;
  animation-delay: calc(var(--row, 0) * 90ms + (var(--i, 1) - 1) * 45ms);
}

.bar-row__track--highlight .bar-row__segment--on {
  background: var(--segment-on-highlight);
}

@keyframes segment-rise {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
