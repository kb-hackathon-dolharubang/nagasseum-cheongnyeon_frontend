<script setup>
import { formatWon } from '@/shared/utils/formatter'

import AssetAccountCard from '@/features/asset/components/AssetAccountCard.vue'

defineProps({
  label: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  accounts: { type: Array, required: true },
  emptyMessage: { type: String, default: '보유 중인 자산이 없어요' },
})
</script>

<template>
  <section class="asset-category-section">
    <div class="asset-category-section__header">
      <span class="asset-category-section__label">{{ label }} · {{ accounts.length }}개</span>
      <span class="asset-category-section__total">{{ formatWon(totalAmount) }}</span>
    </div>

    <div class="asset-category-section__list">
      <AssetAccountCard v-for="account in accounts" :key="account.id" :account="account" />
      <p v-if="accounts.length === 0" class="asset-category-section__empty">{{ emptyMessage }}</p>
    </div>
  </section>
</template>

<style scoped>
.asset-category-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.asset-category-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px;
}

.asset-category-section__label {
  font-size: 13px;
  color: #7fa398;
}

.asset-category-section__total {
  font-size: 13px;
  color: var(--accent, #e3ffe8);
}

.asset-category-section__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.asset-category-section__empty {
  margin: 0;
  padding: 24px 0;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  color: #888888;
  font-size: 13px;
  text-align: center;
}
</style>
