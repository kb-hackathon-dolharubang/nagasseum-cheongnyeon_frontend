<script setup>
import { ref, computed } from 'vue'

import { SIDO_LIST, GUGUN_BY_SIDO } from '@/shared/constants/regions'

const props = defineProps({
  modelValue: { type: String, default: null }, // 선택된 구/군 코드
})

const emit = defineEmits(['update:modelValue'])

const selectedSido = ref(SIDO_LIST[0].code)

const gugunOptions = computed(() => GUGUN_BY_SIDO[selectedSido.value] ?? [])

const selectedSidoName = computed(
  () => SIDO_LIST.find((sido) => sido.code === selectedSido.value)?.name ?? '',
)

const selectedGugunName = computed(
  () => gugunOptions.value.find((gugun) => gugun.code === props.modelValue)?.name ?? '',
)

function onSidoChange(event) {
  // 시/도를 바꾸면 이전 시/도의 구/군 선택은 더 이상 유효하지 않으므로 초기화한다
  selectedSido.value = event.target.value
  emit('update:modelValue', null)
}

function onGugunChange(event) {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <div class="region-select">
    <div class="region-select__label">희망 지역</div>

    <div class="region-select__row">
      <select class="region-select__select" :value="selectedSido" @change="onSidoChange">
        <option v-for="sido in SIDO_LIST" :key="sido.code" :value="sido.code">
          {{ sido.name }}
        </option>
      </select>

      <select
        v-if="gugunOptions.length"
        class="region-select__select"
        :value="modelValue"
        @change="onGugunChange"
      >
        <option value="" disabled>구/군 선택</option>
        <option v-for="gugun in gugunOptions" :key="gugun.code" :value="gugun.code">
          {{ gugun.name }}
        </option>
      </select>
      <select v-else class="region-select__select" disabled>
        <option>해당 지역의 구/군 정보는 준비 중이에요</option>
      </select>
    </div>

    <p v-if="selectedGugunName" class="region-select__summary">
      선택됨:
      <span class="region-select__summary-name"
        >{{ selectedSidoName }} {{ selectedGugunName }}</span
      >
    </p>
  </div>
</template>

<style scoped>
.region-select {
  width: 100%;
}

.region-select__label {
  margin-bottom: 16px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.region-select__row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.region-select__select {
  flex: 1;
  min-width: 0;
  padding: 14px 16px;
  border: none;
  border-radius: 15px;
  background: var(--card-bg, #161616);
  color: var(--text-h, #ffffff);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.region-select__select:disabled {
  color: var(--text, #9aa09a);
  cursor: not-allowed;
}

.region-select__summary {
  margin: 0;
  color: var(--color-text-secondary, #9aa09a);
  font-size: 13px;
}

.region-select__summary-name {
  color: var(--color-heading-accent, #e3ffe8);
  font-weight: 700;
}
</style>
