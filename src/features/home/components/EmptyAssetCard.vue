<script setup>
import BaseCard from '@/shared/components/atoms/base/card/BaseCard.vue'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'

defineProps({
  errorMessage: { type: String, default: '' },
})
defineEmits(['link-asset'])
</script>

<template>
  <BaseCard class="empty-asset-card">
    <p class="empty-asset-card__heading">
      {{ errorMessage ? '자산 동기화에 실패했어요' : '연동된 자산이 없어요' }}
    </p>
    <p class="empty-asset-card__desc">
      {{ errorMessage || '금융기관을 연동하면 자산 현황을 한눈에 볼 수 있어요' }}
    </p>
    <BaseButton
      class="empty-asset-card__cta"
      variant="primary"
      size="lg"
      @click="$emit('link-asset')"
      >{{ errorMessage ? '다시 연동하기' : '자산 연동하기' }}</BaseButton
    >
  </BaseCard>
</template>

<style scoped>
.empty-asset-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
  background: var(--empty-asset-surface, #f7ffd1);
  font-family: var(--sans-normal);
}

.empty-asset-card__heading {
  font-size: 16px;
  font-weight: 900;
  color: var(--empty-asset-heading, #16281c);
}

.empty-asset-card__desc {
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.5;
  color: var(--empty-asset-heading, #16281c);
  opacity: 0.7;
}

.empty-asset-card :deep(.empty-asset-card__cta) {
  font-weight: 900;
}
</style>
