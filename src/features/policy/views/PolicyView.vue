<script setup>
import { onMounted } from 'vue'

import { usePolicyStore } from '@/features/policy/store/policyStore'
import PolicyCard from '@/features/policy/components/PolicyCard.vue'
import PolicyDetailModal from '@/features/policy/components/PolicyDetailModal.vue'
import SortBottomSheet from '@/features/policy/components/SortBottomSheet.vue'

const store = usePolicyStore()

const CATEGORIES = ['전체', '주거', '금융', '마감']

onMounted(() => {
  store.fetchList()
})
</script>

<template>
  <div class="policy-view">
    <header class="policy-view__header">
      <h1 class="policy-view__title">맞춤 정책</h1>
      <p class="policy-view__subtitle">내 정보 기준 · 적합도 순</p>
    </header>

    <div class="policy-view__search-row">
      <div class="policy-view__search">
        <svg class="policy-view__search-icon" viewBox="0 0 16 16" fill="none">
          <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" stroke-width="1.4" />
          <path d="M10 10L14 14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
        </svg>
        <input
          class="policy-view__search-input"
          type="search"
          placeholder="정책명 검색"
          :value="store.keyword"
          @input="store.setKeyword($event.target.value)"
        />
      </div>
    </div>

    <div class="policy-view__filter-row">
      <div class="policy-view__categories">
        <button
          v-for="cat in CATEGORIES"
          :key="cat"
          type="button"
          class="policy-view__category-btn"
          :class="{ 'policy-view__category-btn--active': store.largeCategory === cat }"
          @click="store.setCategory(cat)"
        >
          {{ cat }}
        </button>
      </div>
      <button type="button" class="policy-view__sort-btn" @click="store.showSortSheet = true">
        {{ store.sortLabel }} ▾
      </button>
    </div>

    <div v-if="store.loading" class="policy-view__loading">
      <span class="policy-view__spinner" />
    </div>

    <div v-else-if="store.policies.length === 0" class="policy-view__empty">
      <div class="policy-view__empty-icon" />
      <p class="policy-view__empty-text">조건에 맞는 정책이<br />없어요</p>
      <p class="policy-view__empty-hint">필터나 검색어를 바꿔보세요</p>
    </div>

    <ul v-else class="policy-view__list">
      <li v-for="(policy, index) in store.policies" :key="policy.id">
        <PolicyCard
          :policy="policy"
          :style="{ animationDelay: `${index * 0.05}s` }"
          @click="store.openDetail(policy.id)"
        />
      </li>
    </ul>

    <SortBottomSheet
      v-if="store.showSortSheet"
      :model-value="store.sort"
      @update:model-value="store.setSort"
      @close="store.showSortSheet = false"
    />

    <PolicyDetailModal
      v-if="store.selectedPolicy !== null || store.detailLoading"
      :policy="store.selectedPolicy"
      :loading="store.detailLoading"
      @close="store.closeDetail"
    />
  </div>
</template>

<style scoped>
.policy-view {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.policy-view__header {
  text-align: center;
  padding-top: 4px;
}

.policy-view__title {
  margin: 0 0 2px;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
  font-family: var(--sans-normal);
}

.policy-view__subtitle {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-tertiary, #6f766d);
  font-family: var(--sans-normal);
}

.policy-view__search-row {
  position: relative;
}

.policy-view__search {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 12px;
  background: var(--color-surface, #161616);
  border: 1px solid var(--color-border, #262626);
  border-radius: 12px;
}

.policy-view__search-icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  color: var(--color-text-tertiary, #6f766d);
}

.policy-view__search-input {
  flex: 1;
  border: none;
  background: none;
  font-size: 13px;
  color: var(--color-text-primary, #ffffff);
  font-family: var(--sans-normal);
  outline: none;
}

.policy-view__search-input::placeholder {
  color: var(--color-text-tertiary, #6f766d);
}

.policy-view__search-input::-webkit-search-cancel-button {
  -webkit-appearance: none;
}

.policy-view__filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.policy-view__categories {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
}

.policy-view__categories::-webkit-scrollbar {
  display: none;
}

.policy-view__category-btn {
  flex-shrink: 0;
  height: 28px;
  padding: 0 12px;
  border: 1px solid var(--color-border, #262626);
  border-radius: 20px;
  background: none;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-secondary, #9aa09a);
  font-family: var(--sans-normal);
  cursor: pointer;
  transition: all 0.15s ease;
}

.policy-view__category-btn--active {
  border-color: var(--color-primary, #1d6b3f);
  background: var(--color-primary-soft, #e3ffe8);
  color: var(--color-primary, #1d6b3f);
}

.policy-view__sort-btn {
  flex-shrink: 0;
  border: none;
  background: none;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-tertiary, #6f766d);
  font-family: var(--sans-normal);
  cursor: pointer;
  white-space: nowrap;
}

.policy-view__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.policy-view__spinner {
  width: 28px;
  height: 28px;
  border: 2px solid var(--color-border, #262626);
  border-top-color: var(--color-primary, #1d6b3f);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.policy-view__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
  text-align: center;
}

.policy-view__empty-icon {
  width: 48px;
  height: 48px;
  border: 2px dashed var(--color-border, #262626);
  border-radius: 14px;
}

.policy-view__empty-text {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-secondary, #9aa09a);
  line-height: 1.7;
  font-family: var(--sans-normal);
}

.policy-view__empty-hint {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-tertiary, #6f766d);
  line-height: 1.6;
  font-family: var(--sans-normal);
}

.policy-view__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
