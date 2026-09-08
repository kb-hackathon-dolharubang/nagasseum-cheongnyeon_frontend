<script setup>
import { computed } from 'vue'

import BaseCard from '@/shared/components/atoms/base/card/BaseCard.vue'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'
import BaseBadge from '@/shared/components/atoms/base/badge/BaseBadge.vue'
import { formatMonthDayWeekdayKo } from '@/shared/utils/formatter'
import { getCategorySubjectLabel } from '@/features/consult/constants/categories'
import { CONSULTATION_STATUS_META } from '@/features/consult/constants/status'

// 사용자 쪽 ConsultationCard(내 상담 목록)와 같은 시각 언어를 그대로 쓰되, 표시 대상이
// 상담사가 아니라 사용자다 - 상담사 홈에서는 상대가 사용자이므로 "OO 상담사" 접미사를
// 붙이지 않고 이름을 그대로 보여준다.
const props = defineProps({
  reservationId: { type: Number, required: true },
  userName: { type: String, required: true },
  category: { type: String, default: null },
  reservationDate: { type: String, required: true },
  reservationTime: { type: String, required: true },
  status: { type: String, required: true },
  // 오늘의 상담/진행 중인 상담은 시간만, 다가오는 상담은 날짜까지 보여준다.
  showDate: { type: Boolean, default: false },
  // 다가오는 상담은 해커톤 MVP 우선 정책상 입장 버튼을 생략할 수 있다.
  showCta: { type: Boolean, default: true },
})

const emit = defineEmits(['enter-chat'])

const statusMeta = computed(
  () => CONSULTATION_STATUS_META[props.status] ?? CONSULTATION_STATUS_META.RESERVED,
)
const subjectLabel = computed(() => getCategorySubjectLabel(props.category))
const scheduleLabel = computed(() =>
  props.showDate
    ? `${formatMonthDayWeekdayKo(props.reservationDate)} · ${props.reservationTime}`
    : props.reservationTime,
)
const ctaLabel = computed(() => (props.status === 'IN_PROGRESS' ? '상담 계속하기' : '상담 입장'))

function handleCta() {
  emit('enter-chat', props.reservationId)
}
</script>

<template>
  <BaseCard
    class="counselor-consultation-card"
    :class="{ 'counselor-consultation-card--active': status === 'IN_PROGRESS' }"
  >
    <div class="counselor-consultation-card__top">
      <div class="counselor-consultation-card__avatar">
        <span class="counselor-consultation-card__avatar-fallback">{{ userName.charAt(0) }}</span>
      </div>
      <div class="counselor-consultation-card__info">
        <p class="counselor-consultation-card__name">{{ userName }}</p>
        <p class="counselor-consultation-card__subject">{{ subjectLabel }}</p>
      </div>
      <BaseBadge :variant="statusMeta.badgeVariant">{{ statusMeta.label }}</BaseBadge>
    </div>

    <p class="counselor-consultation-card__schedule">{{ scheduleLabel }}</p>

    <BaseButton
      v-if="showCta"
      class="counselor-consultation-card__button"
      variant="primary"
      size="md"
      @click="handleCta"
    >
      {{ ctaLabel }}
    </BaseButton>
  </BaseCard>
</template>

<style scoped>
.counselor-consultation-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* '상담 중'은 다른 상태보다 더 쉽게 인지해야 해서, point 배지와 같은 색으로 옅은 테두리를
   더한다 - 사용자 쪽 ConsultationCard와 같은 색(rgba(193,68,46))만 재사용한다. */
.counselor-consultation-card--active {
  border: 1px solid rgba(193, 68, 46, 0.3);
}

.counselor-consultation-card__top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.counselor-consultation-card__avatar {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  overflow: hidden;
  border-radius: 22px;
  background: var(--color-surface-soft, #cdedd3);
}

.counselor-consultation-card__avatar-fallback {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-primary, #1d6b3f);
}

.counselor-consultation-card__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.counselor-consultation-card__name {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.counselor-consultation-card__subject {
  margin: 0;
  font-size: 12.5px;
  color: var(--color-text-secondary, #9aa09a);
}

.counselor-consultation-card__schedule {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-tertiary, #6f766d);
  font-variant-numeric: tabular-nums;
}

.counselor-consultation-card__button {
  align-self: flex-end;
}
</style>
