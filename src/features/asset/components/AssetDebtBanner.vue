<script setup>
import { computed } from 'vue'

import { formatWon } from '@/shared/utils/formatter'

import loanIcon from '@/assets/images/asset/loan.png'

const props = defineProps({
  /** assetStore가 만든 대출 목록 ({ id, name, subLabel, amount }) */
  loans: { type: Array, default: () => [] },
})

const totalBalance = computed(() =>
  props.loans.reduce((total, loan) => total + (loan.amount ?? 0), 0),
)
</script>

<template>
  <!-- 대출이 없으면 배너 자체를 띄우지 않는다. -->
  <section v-if="loans.length > 0" class="debt">
    <div class="debt__head">
      <span class="debt__slot">
        <img class="debt__icon" :src="loanIcon" alt="" />
      </span>
      <span class="debt__title">디버프 · 대출</span>
      <span class="debt__total">-{{ formatWon(totalBalance) }}</span>
    </div>

    <ul class="debt__list">
      <li v-for="loan in loans" :key="loan.id" class="debt__item">
        <span class="debt__item-name">{{ loan.name }}</span>
        <span class="debt__item-amount">-{{ formatWon(loan.amount) }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
/*
  대출만 빨강
*/
.debt {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 11px 12px;
  border: 1px solid var(--c-danger-line);
  border-radius: 14px;
  background: var(--c-danger-soft);
  line-height: 1.35;
}

.debt__head {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 아이템 타일과 같은 이유로 아이콘 뒤에 진한 칸을 깐다. 여기만 붉은 칸을 쓴다. */
.debt__slot {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--c-danger-slot);
}

.debt__icon {
  width: 18px;
  height: 18px;
  image-rendering: pixelated;
}

.debt__title {
  flex: 1;
  color: var(--c-danger);
  font-size: 13px;
  font-weight: 700;
}

.debt__total {
  color: var(--c-danger);
  font-size: 13px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.debt__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.debt__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 11px;
}

.debt__item-name {
  overflow: hidden;
  color: var(--c-ink-muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.debt__item-amount {
  flex: none;
  color: var(--c-ink-muted);
  font-variant-numeric: tabular-nums;
}
</style>
