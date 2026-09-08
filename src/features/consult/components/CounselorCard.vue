<script setup>
import BaseCard from '@/shared/components/atoms/base/card/BaseCard.vue'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'
import BaseBadge from '@/shared/components/atoms/base/badge/BaseBadge.vue'

const props = defineProps({
  counselor: { type: Object, required: true },
})

const emit = defineEmits(['reserve'])

function handleReserve() {
  emit('reserve', props.counselor.id)
}
</script>

<template>
  <BaseCard class="counselor-card">
    <div class="counselor-card__profile">
      <div class="counselor-card__avatar">
        <img
          v-if="counselor.image"
          class="counselor-card__avatar-img"
          :src="counselor.image"
          alt=""
        />
        <span v-else class="counselor-card__avatar-fallback">{{ counselor.name.charAt(0) }}</span>
      </div>
      <div class="counselor-card__info">
        <p class="counselor-card__name">{{ counselor.name }} 상담사</p>
        <p class="counselor-card__title">{{ counselor.title }}</p>
        <p class="counselor-card__meta">
          ★ {{ counselor.rating }} · 상담 {{ counselor.consultationCount }}건 ·
          {{ counselor.career }}
        </p>
      </div>
    </div>

    <div class="counselor-card__tags">
      <BaseBadge v-for="category in counselor.categories" :key="category" variant="mint">
        {{ category }}
      </BaseBadge>
    </div>

    <div class="counselor-card__earliest">
      <span class="counselor-card__earliest-label">가장 빠른 상담</span>
      <span class="counselor-card__earliest-value">{{ counselor.earliestAvailable }}</span>
    </div>

    <BaseButton class="counselor-card__button" variant="primary" size="md" @click="handleReserve">
      예약하기
    </BaseButton>
  </BaseCard>
</template>

<style scoped>
.counselor-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.counselor-card__profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.counselor-card__avatar {
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

.counselor-card__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.counselor-card__avatar-fallback {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-primary, #1d6b3f);
}

.counselor-card__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.counselor-card__name {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.counselor-card__title {
  margin: 0;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--color-primary, #1d6b3f);
}

.counselor-card__meta {
  margin: 2px 0 0;
  font-size: 11px;
  line-height: 1.4;
  color: var(--color-text-tertiary, #6f766d);
}

.counselor-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.counselor-card__earliest {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 12px;
  background: var(--color-app-bg, #f7f8f4);
}

.counselor-card__earliest-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-tertiary, #8f968c);
}

.counselor-card__earliest-value {
  font-size: 13px;
  font-weight: 800;
  color: var(--color-text-primary, #ffffff);
  font-variant-numeric: tabular-nums;
}

.counselor-card__button {
  align-self: flex-end;
  margin-top: 2px;
}
</style>
