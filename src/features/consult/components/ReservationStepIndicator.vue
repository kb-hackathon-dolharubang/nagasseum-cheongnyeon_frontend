<script setup>
defineProps({
  current: { type: Number, required: true }, // 1 | 2 | 3
})

const STEPS = [
  { number: 1, label: '일정 선택' },
  { number: 2, label: '상담 정보' },
  { number: 3, label: '예약 완료' },
]
</script>

<template>
  <div class="reservation-step-indicator">
    <span class="reservation-step-indicator__line" />
    <div
      v-for="step in STEPS"
      :key="step.number"
      class="reservation-step-indicator__step"
      :class="{ 'reservation-step-indicator__step--active': step.number === current }"
    >
      <span class="reservation-step-indicator__number">{{ step.number }}</span>
      <span class="reservation-step-indicator__label">{{ step.label }}</span>
    </div>
  </div>
</template>

<style scoped>
.reservation-step-indicator {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  padding: 2px 0;
}

/* 번호 원 중앙 높이(padding-top 2px + 원 반지름 10px)를 지나는 연결선.
   양쪽 끝 원의 중심(각 칸의 가운데, 전체 폭의 1/6·5/6 지점)까지만 이어서
   원 밖으로 삐져나오지 않게 한다. */
.reservation-step-indicator__line {
  position: absolute;
  top: 12px;
  left: calc(100% / 6);
  right: calc(100% / 6);
  height: 1px;
  background: var(--color-border, #262626);
}

.reservation-step-indicator__step {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.reservation-step-indicator__number {
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

.reservation-step-indicator__label {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--color-text-tertiary, #6f766d);
  white-space: nowrap;
}

.reservation-step-indicator__step--active .reservation-step-indicator__number {
  background: var(--base-button-primary-bg, #e3ffe8);
  color: var(--base-button-primary-text, #16281c);
}

.reservation-step-indicator__step--active .reservation-step-indicator__label {
  color: var(--color-text-primary, #ffffff);
  font-weight: 700;
}
</style>
