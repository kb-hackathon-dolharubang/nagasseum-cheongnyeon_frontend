<script setup>
import { computed } from 'vue'

import BaseCard from '@/shared/components/atoms/base/card/BaseCard.vue'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'
import BaseBadge from '@/shared/components/atoms/base/badge/BaseBadge.vue'
import { formatMonthDayWeekdayKo } from '@/shared/utils/formatter'
import { getCategorySubjectLabel } from '@/features/consult/constants/categories'
import { CONSULTATION_STATUS_META } from '@/features/consult/constants/status'

const props = defineProps({
  reservationId: { type: Number, required: true },
  counselor: { type: Object, default: null },
  category: { type: String, default: null },
  reservationDate: { type: String, required: true },
  reservationTime: { type: String, required: true },
  status: { type: String, required: true },
})

const emit = defineEmits(['enter-chat', 'view-report'])

const statusMeta = computed(
  () => CONSULTATION_STATUS_META[props.status] ?? CONSULTATION_STATUS_META.RESERVED,
)
const subjectLabel = computed(() => getCategorySubjectLabel(props.category))
const scheduleLabel = computed(
  () => `${formatMonthDayWeekdayKo(props.reservationDate)} · ${props.reservationTime}`,
)

const ctaLabel = computed(() => {
  if (props.status === 'IN_PROGRESS') return '상담 계속하기'
  if (props.status === 'COMPLETED') return '상담 리포트 보기'
  return '상담 입장'
})

function handleCta() {
  if (props.status === 'COMPLETED') {
    emit('view-report', props.reservationId)
  } else {
    emit('enter-chat', props.reservationId)
  }
}
</script>

<template>
  <BaseCard
    class="consultation-card"
    :class="{ 'consultation-card--active': status === 'IN_PROGRESS' }"
  >
    <div class="consultation-card__top">
      <div class="consultation-card__avatar">
        <img
          v-if="counselor?.image"
          class="consultation-card__avatar-img"
          :src="counselor.image"
          alt=""
        />
        <span v-else class="consultation-card__avatar-fallback">{{
          counselor?.name?.charAt(0) ?? '?'
        }}</span>
      </div>
      <div class="consultation-card__info">
        <p class="consultation-card__name">{{ counselor?.name ?? '상담사' }} 상담사</p>
        <p class="consultation-card__subject">{{ subjectLabel }}</p>
      </div>
      <BaseBadge :variant="statusMeta.badgeVariant">{{ statusMeta.label }}</BaseBadge>
    </div>

    <p v-if="status !== 'IN_PROGRESS'" class="consultation-card__schedule">{{ scheduleLabel }}</p>

    <BaseButton class="consultation-card__button" variant="primary" size="md" @click="handleCta">
      {{ ctaLabel }}
    </BaseButton>
  </BaseCard>
</template>

<style scoped>
.consultation-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* '상담 중'은 다른 상태보다 더 쉽게 인지해야 해서, point 배지와 같은 색으로 옅은 테두리를
   더한다 - 새 강조색을 만들지 않고 BaseBadge point variant의 색(rgba(193,68,46))만 그대로 쓴다. */
.consultation-card--active {
  border: 1px solid rgba(193, 68, 46, 0.3);
}

.consultation-card__top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.consultation-card__avatar {
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

.consultation-card__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.consultation-card__avatar-fallback {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-primary, #1d6b3f);
}

.consultation-card__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.consultation-card__name {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.consultation-card__subject {
  margin: 0;
  font-size: 12.5px;
  color: var(--color-text-secondary, #9aa09a);
}

.consultation-card__schedule {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-tertiary, #6f766d);
  font-variant-numeric: tabular-nums;
}

.consultation-card__button {
  align-self: flex-end;
}
</style>
