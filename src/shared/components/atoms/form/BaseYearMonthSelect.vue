<script setup>
import { computed, onMounted } from 'vue'

function getNextMonth() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // 1~12
  return month === 12 ? `${year + 1}-01` : `${year}-${String(month + 1).padStart(2, '0')}`
}

function monthsFrom(start) {
  const list = []
  for (let m = start; m <= 12; m++) list.push(m)
  return list
}

const props = defineProps({
  label: { type: String, default: '' },
  modelValue: { type: String, default: '' }, // 'YYYY-MM'
  minValue: { type: String, default: '' }, // 'YYYY-MM', 비어있으면 다음 달을 최소값으로 사용
  yearSpan: { type: Number, default: 15 },
})

const emit = defineEmits(['update:modelValue'])

const effectiveMinValue = computed(() => props.minValue || getNextMonth())
const minYear = computed(() => Number(effectiveMinValue.value.split('-')[0]))
const minMonth = computed(() => Number(effectiveMinValue.value.split('-')[1]))

const years = computed(() => {
  const list = []
  for (let y = minYear.value; y < minYear.value + props.yearSpan; y++) list.push(y)
  return list
})

const selectedYear = computed(() => Number(props.modelValue?.split('-')[0]) || minYear.value)
const selectedMonth = computed(() => Number(props.modelValue?.split('-')[1]) || minMonth.value)

const months = computed(() =>
  selectedYear.value === minYear.value ? monthsFrom(minMonth.value) : monthsFrom(1),
)

function emitValue(year, month) {
  emit('update:modelValue', `${year}-${String(month).padStart(2, '0')}`)
}

function onYearChange(event) {
  const year = Number(event.target.value)
  const validMonths = year === minYear.value ? monthsFrom(minMonth.value) : monthsFrom(1)
  const month = validMonths.includes(selectedMonth.value) ? selectedMonth.value : validMonths[0]
  emitValue(year, month)
}

function onMonthChange(event) {
  emitValue(selectedYear.value, Number(event.target.value))
}

onMounted(() => {
  if (!props.modelValue || props.modelValue < effectiveMinValue.value) {
    emit('update:modelValue', effectiveMinValue.value)
  }
})
</script>

<template>
  <div class="year-month-select">
    <div v-if="label" class="year-month-select__label">{{ label }}</div>
    <div class="year-month-select__row">
      <select class="year-month-select__select" :value="selectedYear" @change="onYearChange">
        <option v-for="year in years" :key="year" :value="year">{{ year }}년</option>
      </select>
      <select class="year-month-select__select" :value="selectedMonth" @change="onMonthChange">
        <option v-for="month in months" :key="month" :value="month">{{ month }}월</option>
      </select>
    </div>
  </div>
</template>

<style scoped>
.year-month-select {
  width: 100%;
}

.year-month-select__label {
  margin-bottom: 16px;
  font-weight: 700;
  color: var(--text-h, #ffffff);
}

.year-month-select__row {
  display: flex;
  gap: 12px;
}

.year-month-select__select {
  flex: 1;
  padding: 14px 16px;
  border: none;
  border-radius: 15px;
  background: var(--card-bg, #161616);
  color: var(--text-h, #ffffff);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
</style>
