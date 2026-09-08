<script setup>
import { formatWon } from '@/shared/utils/formatter'

defineProps({
  account: { type: Object, required: true },
})
</script>

<template>
  <div class="asset-account-card">
    <div class="asset-account-card__info">
      <p class="asset-account-card__name">{{ account.name }}</p>
      <p class="asset-account-card__sub">{{ account.subLabel }}</p>
    </div>
    <p class="asset-account-card__amount">{{ formatWon(account.amount) }}</p>
  </div>
</template>

<style scoped>
.asset-account-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  border-radius: 16px;
  background: var(--color-mint-pale, #cdedd3);
}

.asset-account-card__info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.asset-account-card__name {
  margin: 0;
  overflow: hidden;
  font-size: 14px;
  color: #111111;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.asset-account-card__sub {
  margin: 0;
  font-size: 12px;
  color: #3a5a4a;
}

.asset-account-card__amount {
  flex-shrink: 0;
  margin: 0;
  font-size: 15px;
  color: #0b3b24;
  text-align: right;
}
</style>
