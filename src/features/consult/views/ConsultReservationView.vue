<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppHeader from '@/shared/components/molecules/AppHeader.vue'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'
import { formatYearMonthKo, formatMonthDayWeekdayKo } from '@/shared/utils/formatter'
import { counselors, availableReservationSlots } from '@/features/consult/data/counselors'

const props = defineProps({
  counselorId: { type: String, required: true },
})

const router = useRouter()

const counselor = computed(
  () => counselors.find((item) => item.id === Number(props.counselorId)) ?? null,
)

// 상담 홈에서 분야 칩을 고른 채로 들어왔다면 그 값을 이어받는다(상담 홈 구조는 건드리지
// 않고, 진입 시점의 router state만 읽는다). '전체'처럼 특정 분야가 아니면 null이다.
const incomingCategory = window.history.state?.category ?? null

const slotsByDate = computed(() => availableReservationSlots[Number(props.counselorId)] ?? [])
const slotDateSet = computed(() => new Set(slotsByDate.value.map((entry) => entry.date)))

function toDateKey(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const today = new Date()
today.setHours(0, 0, 0, 0)

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

const currentMonth = ref(startOfMonth(today))
const selectedDate = ref(null)
const selectedTime = ref(null)

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

// 그리드는 1일 앞의 빈 칸 + 해당 월의 모든 날짜로 채운다. 빈 칸은 null로 둬서 요일 위치만
// 맞추고 렌더링에서 건너뛴다.
const calendarCells = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = Array.from({ length: firstWeekday }, () => null)
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day))
  }
  return cells
})

// 과거·당일은 예약 정책상 항상 선택 불가. 그 외에는 Mock 일정이 있는 날짜만 선택할 수 있다.
function isSelectable(date) {
  return date > today && slotDateSet.value.has(toDateKey(date))
}

function isPrevMonthDisabled() {
  return currentMonth.value <= startOfMonth(today)
}

function goPrevMonth() {
  if (isPrevMonthDisabled()) return
  const d = currentMonth.value
  currentMonth.value = new Date(d.getFullYear(), d.getMonth() - 1, 1)
}

function goNextMonth() {
  const d = currentMonth.value
  currentMonth.value = new Date(d.getFullYear(), d.getMonth() + 1, 1)
}

function selectDate(date) {
  if (!date || !isSelectable(date)) return
  selectedDate.value = toDateKey(date)
  // 날짜를 바꾸면 이전에 고른 시간이 새 날짜에 없을 수 있어 항상 초기화한다.
  selectedTime.value = null
}

const slotsForSelectedDate = computed(
  () => slotsByDate.value.find((entry) => entry.date === selectedDate.value)?.slots ?? [],
)

function selectTime(slot) {
  if (!slot.available) return
  selectedTime.value = slot.time
}

const canProceed = computed(() => Boolean(selectedDate.value && selectedTime.value))

function goNext() {
  if (!canProceed.value) return
  router.push({
    name: 'consult-reservation-info',
    params: { counselorId: props.counselorId },
    state: {
      date: selectedDate.value,
      time: selectedTime.value,
      category: incomingCategory,
    },
  })
}
</script>

<template>
  <div class="consult-reservation-view">
    <AppHeader title="상담 예약" @back="router.back()" />

    <template v-if="counselor">
      <div class="consult-reservation-view__counselor">
        <div class="consult-reservation-view__avatar">
          <img
            v-if="counselor.image"
            class="consult-reservation-view__avatar-img"
            :src="counselor.image"
            alt=""
          />
          <span v-else class="consult-reservation-view__avatar-fallback">{{
            counselor.name.charAt(0)
          }}</span>
        </div>
        <div class="consult-reservation-view__counselor-info">
          <p class="consult-reservation-view__counselor-name">{{ counselor.name }} 상담사</p>
          <p class="consult-reservation-view__counselor-type">1:1 채팅 상담</p>
        </div>
      </div>

      <div class="consult-reservation-view__steps">
        <div class="consult-reservation-view__step consult-reservation-view__step--active">
          <span class="consult-reservation-view__step-number">1</span>
          <span class="consult-reservation-view__step-label">일정 선택</span>
        </div>
        <span class="consult-reservation-view__step-divider" />
        <div class="consult-reservation-view__step">
          <span class="consult-reservation-view__step-number">2</span>
          <span class="consult-reservation-view__step-label">상담 정보</span>
        </div>
        <span class="consult-reservation-view__step-divider" />
        <div class="consult-reservation-view__step">
          <span class="consult-reservation-view__step-number">3</span>
          <span class="consult-reservation-view__step-label">예약 완료</span>
        </div>
      </div>

      <section class="consult-reservation-view__section">
        <h2 class="consult-reservation-view__section-title">날짜를 선택해주세요</h2>

        <div class="consult-reservation-view__calendar">
          <div class="consult-reservation-view__calendar-head">
            <button
              type="button"
              class="consult-reservation-view__month-nav"
              aria-label="이전 달"
              :disabled="isPrevMonthDisabled()"
              @click="goPrevMonth"
            >
              ‹
            </button>
            <p class="consult-reservation-view__month-label">
              {{ formatYearMonthKo(currentMonth) }}
            </p>
            <button
              type="button"
              class="consult-reservation-view__month-nav"
              aria-label="다음 달"
              @click="goNextMonth"
            >
              ›
            </button>
          </div>

          <div class="consult-reservation-view__weekdays">
            <span v-for="label in WEEKDAY_LABELS" :key="label">{{ label }}</span>
          </div>

          <div class="consult-reservation-view__days">
            <span
              v-for="(date, index) in calendarCells"
              :key="index"
              class="consult-reservation-view__day-cell"
            >
              <button
                v-if="date"
                type="button"
                class="consult-reservation-view__day"
                :class="{
                  'consult-reservation-view__day--selectable': isSelectable(date),
                  'consult-reservation-view__day--selected': toDateKey(date) === selectedDate,
                }"
                :disabled="!isSelectable(date)"
                @click="selectDate(date)"
              >
                {{ date.getDate() }}
              </button>
            </span>
          </div>
        </div>
      </section>

      <section v-if="selectedDate" class="consult-reservation-view__section">
        <h2 class="consult-reservation-view__section-title">
          {{ formatMonthDayWeekdayKo(selectedDate) }}
        </h2>
        <p class="consult-reservation-view__time-caption">예약 가능한 시간</p>

        <div class="consult-reservation-view__times">
          <button
            v-for="slot in slotsForSelectedDate"
            :key="slot.time"
            type="button"
            class="consult-reservation-view__time"
            :class="{ 'consult-reservation-view__time--selected': slot.time === selectedTime }"
            :disabled="!slot.available"
            @click="selectTime(slot)"
          >
            {{ slot.time }}<span v-if="!slot.available"> 마감</span>
          </button>
        </div>
      </section>
    </template>

    <p v-else class="consult-reservation-view__notice">상담사 정보를 찾을 수 없어요.</p>

    <div class="consult-reservation-view__footer">
      <BaseButton size="lg" :disabled="!canProceed" @click="goNext">다음</BaseButton>
    </div>
  </div>
</template>

<style scoped>
.consult-reservation-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── 상담사 요약 ───────────────────────────────────────────── */

.consult-reservation-view__counselor {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 4px;
}

.consult-reservation-view__avatar {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  overflow: hidden;
  border-radius: 26px;
  background: var(--color-surface-soft, #cdedd3);
}

.consult-reservation-view__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.consult-reservation-view__avatar-fallback {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-primary, #1d6b3f);
}

.consult-reservation-view__counselor-name {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.consult-reservation-view__counselor-type {
  margin: 2px 0 0;
  font-size: 12.5px;
  color: var(--color-text-secondary, #9aa09a);
}

/* ── 진행 단계 ─────────────────────────────────────────────── */

.consult-reservation-view__steps {
  display: flex;
  align-items: center;
  gap: 6px;
}

.consult-reservation-view__step {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: none;
}

.consult-reservation-view__step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 10px;
  background: var(--color-progress-inactive, #262626);
  color: var(--color-text-tertiary, #6f766d);
  font-size: 11px;
  font-weight: 700;
}

.consult-reservation-view__step-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-tertiary, #6f766d);
  white-space: nowrap;
}

.consult-reservation-view__step--active .consult-reservation-view__step-number {
  background: var(--base-button-primary-bg, #e3ffe8);
  color: var(--base-button-primary-text, #16281c);
}

.consult-reservation-view__step--active .consult-reservation-view__step-label {
  color: var(--color-text-primary, #ffffff);
}

.consult-reservation-view__step-divider {
  flex: 1;
  height: 1px;
  background: var(--color-border, #262626);
}

/* ── 섹션 공통 ─────────────────────────────────────────────── */

.consult-reservation-view__section {
  display: flex;
  flex-direction: column;
}

.consult-reservation-view__section-title {
  margin: 0 0 12px;
  padding: 0 4px;
  font-size: 14.5px;
  font-weight: 600;
  color: var(--color-text-primary, #ffffff);
}

/* ── 캘린더 ────────────────────────────────────────────────── */

.consult-reservation-view__calendar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border-radius: 16px;
  background: var(--color-surface, #161616);
  box-shadow: 0 2px 6px rgba(90, 143, 77, 0.06);
}

.consult-reservation-view__calendar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.consult-reservation-view__month-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  color: var(--color-text-primary, #ffffff);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}

.consult-reservation-view__month-nav:disabled {
  color: var(--color-text-tertiary, #6f766d);
  cursor: not-allowed;
}

.consult-reservation-view__month-label {
  margin: 0;
  font-size: 14.5px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.consult-reservation-view__weekdays,
.consult-reservation-view__days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.consult-reservation-view__weekdays span {
  padding: 4px 0;
  text-align: center;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--color-text-tertiary, #6f766d);
}

.consult-reservation-view__day-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
}

.consult-reservation-view__day {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 16px;
  background: none;
  color: var(--color-text-tertiary, #6f766d);
  font: inherit;
  font-size: 13px;
  cursor: not-allowed;
}

.consult-reservation-view__day--selectable {
  color: var(--color-text-primary, #ffffff);
  font-weight: 600;
  cursor: pointer;
}

.consult-reservation-view__day--selected {
  background: var(--base-button-primary-bg, #e3ffe8);
  color: var(--base-button-primary-text, #16281c);
}

/* ── 시간 선택 ─────────────────────────────────────────────── */

.consult-reservation-view__time-caption {
  margin: 0 0 10px;
  padding: 0 4px;
  font-size: 12.5px;
  color: var(--color-text-secondary, #9aa09a);
}

.consult-reservation-view__times {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.consult-reservation-view__time {
  padding: 12px 0;
  border: 1px solid var(--color-border, #262626);
  border-radius: 12px;
  background: var(--color-surface, #161616);
  color: var(--color-text-secondary, #9aa09a);
  font: inherit;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.18s ease,
    color 0.18s ease,
    border-color 0.18s ease;
}

.consult-reservation-view__time--selected {
  border-color: transparent;
  background: var(--base-button-primary-bg, #e3ffe8);
  color: var(--base-button-primary-text, #16281c);
  font-weight: 700;
}

.consult-reservation-view__time:disabled {
  border-color: var(--color-border, #262626);
  background: none;
  color: var(--color-text-tertiary, #6f766d);
  cursor: not-allowed;
}

/* ── 안내/푸터 ─────────────────────────────────────────────── */

.consult-reservation-view__notice {
  padding: 48px 0;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-secondary, #9aa09a);
}

.consult-reservation-view__footer {
  position: sticky;
  bottom: 0;
  z-index: 4;
  padding: 16px 0 8px;
  background: var(--color-app-bg, #111111);
}
</style>
