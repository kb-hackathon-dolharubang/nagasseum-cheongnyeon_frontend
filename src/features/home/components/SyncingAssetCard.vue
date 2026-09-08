<script setup>
import BaseCard from '@/shared/components/atoms/base/card/BaseCard.vue'
</script>

<template>
  <BaseCard class="syncing-asset-card">
    <div class="syncing-asset-card__spinner" />
    <p class="syncing-asset-card__heading">자산을 동기화하고 있어요</p>
    <p class="syncing-asset-card__desc">완료되면 자동으로 반영돼요</p>
  </BaseCard>
</template>

<style scoped>
.syncing-asset-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
  background: var(--empty-asset-surface, #f7ffd1);
  font-family: var(--sans-normal);
}

.syncing-asset-card__spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-toggle-off, #383e3a);
  border-top-color: var(--color-heading-accent);
  border-radius: 50%;
  animation: syncing-asset-card-spin 0.8s linear infinite;
}

.syncing-asset-card__heading {
  font-size: 16px;
  font-weight: 900;
  color: var(--empty-asset-heading, #16281c);
}

.syncing-asset-card__desc {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--empty-asset-heading, #16281c);
  opacity: 0.7;
}

@keyframes syncing-asset-card-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
