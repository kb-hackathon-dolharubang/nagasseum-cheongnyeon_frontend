<script setup>
import { computed } from 'vue'

import { formatWon } from '@/shared/utils/formatter'

import AssetItemTile from '@/features/asset/components/AssetItemTile.vue'

const props = defineProps({
  /** GET /api/v1/assets/accounts 의 institutions 배열 (원본 그대로) */
  institutions: { type: Array, default: () => [] },
  /** 직접 등록한 자산. 기관도 카테고리도 없어서 따로 묶는다 */
  manualAssets: { type: Array, default: () => [] },
})

/**
 * edit — 직접 등록한 자산 타일을 눌렀을 때. 인자로 그 자산의 뷰모델을 그대로 올려보낸다.
 * add  — 직접 등록한 자산이 하나도 없을 때 뜨는 등록 버튼을 눌렀을 때.
 */
defineEmits(['edit', 'add'])

/**
 * 카테고리 표시명.
 */
const CATEGORY_LABELS = {
  CASH: '입출금·현금성 자산',
  DEPOSIT_SAVINGS: '예금·적금',
  INVESTMENT: '주식·펀드',
  SUBSCRIPTION: '청약통장',
  ETC: '기타 자산',
}

/** 보여주는 순서. 여기 없는 카테고리는 뒤로 밀린다 */
const CATEGORY_ORDER = ['CASH', 'DEPOSIT_SAVINGS', 'INVESTMENT', 'SUBSCRIPTION', 'ETC']

/**
 * 명세서 값 → 실제 서버 값.
 */
const CATEGORY_ALIASES = {
  현금성자산: 'CASH',
  예적금: 'DEPOSIT_SAVINGS',
  투자자산: 'INVESTMENT',
  청약: 'SUBSCRIPTION',
  기타: 'ETC',
}

/**
 * 카테고리별로 묶은 아이템 목록.
 *
 * <p>서버는 기관별로 내려주는데, 화면은 카테고리별로 보여준다. 그래서 한 번 펼쳤다가
 * 다시 묶는다. 기관 이름은 타일 안에 넣어 어느 은행 것인지 알 수 있게 한다.
 *
 * <p>직접 등록한 자산(보증금 등)은 카테고리가 없어서 '기타'에 함께 넣는다. 묶음을 따로
 * 만들면 항목 하나짜리 그룹이 생겨 화면만 길어진다.
 *
 * <p>대출은 여기 넣지 않는다. 자산이 아니라 아래 배너에서 따로 다룬다.
 */
const groups = computed(() => {
  const map = new Map()

  function pushTo(key, item) {
    if (!map.has(key)) {
      map.set(key, { key, label: CATEGORY_LABELS[key] ?? key, total: 0, items: [] })
    }
    const group = map.get(key)
    group.total += item.amount
    group.items.push(item)
  }

  for (const institution of props.institutions) {
    for (const account of institution.assetAccounts ?? []) {
      const raw = account.assetCategory
      pushTo(CATEGORY_ALIASES[raw] ?? raw ?? 'ETC', {
        key: `${institution.institutionName}-${account.accountDisplay}`,
        type: account.accountType,
        institution: institution.institutionName,
        name: account.productName,
        amount: account.currentValue ?? account.valuationAmount ?? 0,
      })
    }
  }

  for (const asset of props.manualAssets) {
    pushTo('ETC', {
      key: asset.id,
      type: 'MANUAL',
      institution: '',
      name: asset.name,
      amount: asset.amount ?? 0,
      // 이 값이 있는 항목만 눌러서 고칠 수 있다. 연동 계좌 항목에는 없으므로 자연히 정적으로 남는다.
      manualAsset: asset,
    })
  }

  return [...map.values()].sort((a, b) => {
    // 목록에 없는 카테고리는 맨 뒤로 보낸다.
    const orderA = CATEGORY_ORDER.indexOf(a.key)
    const orderB = CATEGORY_ORDER.indexOf(b.key)
    return (orderA === -1 ? 99 : orderA) - (orderB === -1 ? 99 : orderB)
  })
})

const itemCount = computed(() =>
  groups.value.reduce((total, group) => total + group.items.length, 0),
)
</script>

<template>
  <section class="inventory">
    <div class="inventory__head">
      <span class="inventory__title">보유 아이템</span>
      <span class="inventory__count">{{ itemCount }}개</span>
    </div>

    <div v-for="group in groups" :key="group.key" class="inventory__group">
      <div class="inventory__group-head">
        <span class="inventory__group-name">{{ group.label }}</span>
        <span class="inventory__group-total">총 {{ formatWon(group.total) }}</span>
      </div>

      <div class="inventory__list">
        <AssetItemTile
          v-for="item in group.items"
          :key="item.key"
          :type="item.type"
          :institution="item.institution"
          :name="item.name"
          :amount="item.amount"
          :editable="Boolean(item.manualAsset)"
          @edit="$emit('edit', item.manualAsset)"
        />
      </div>
    </div>

    <p v-if="itemCount === 0" class="inventory__empty">
      아직 연동된 계좌가 없어요.<br />
      금융기관을 연동하면 여기에 모입니다.
    </p>

    <!--
      전월세 보증금은 CODEF로 못 가져와서 회원이 직접 넣어야 하는데, 지금까지는 가입할 때
      딱 한 번만 넣을 수 있었다. 그때 건너뛴 사람이나 나중에 이사한 사람이 등록할 자리가
      여기다. 이미 등록한 자산이 있으면 숨긴다 — 백엔드에 중복 검사가 없어서 버튼을 계속
      띄워두면 "현재 거주 보증금"이 두 개 생긴다.
    -->
    <button
      v-if="manualAssets.length === 0"
      type="button"
      class="inventory__add"
      @click="$emit('add')"
    >
      + 현재 거주 보증금 등록하기
    </button>
  </section>
</template>

<style scoped>
.inventory {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* 실제 보유 항목이 아니라 "여기에 채워 넣으세요"라는 자리라서, 타일과 같은 채운 카드가
   아니라 점선 테두리로 비어 있음을 드러낸다. */
.inventory__add {
  width: 100%;
  padding: 11px;
  border: 1px dashed var(--c-line);
  border-radius: 10px;
  background: none;
  color: var(--c-ink-muted);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.inventory__add:hover,
.inventory__add:focus-visible {
  border-color: var(--c-accent-mid);
  color: var(--c-ink);
}

.inventory__head {
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 0 2px;
}

.inventory__title {
  font-size: 13px;
  font-weight: 700;
  color: var(--c-ink);
}

.inventory__count {
  font-size: 11px;
  color: var(--c-ink-faint);
  font-variant-numeric: tabular-nums;
}

.inventory__group {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.inventory__group-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 0 2px;
}

.inventory__group-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--c-accent);
}

.inventory__group-total {
  font-size: 11px;
  color: var(--c-ink-muted);
  font-variant-numeric: tabular-nums;
}

.inventory__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.inventory__empty {
  margin: 0;
  padding: 28px 0;
  border: 1px solid var(--c-line);
  border-radius: 14px;
  background: var(--c-card);
  color: var(--c-ink-muted);
  font-size: 13px;
  line-height: 1.7;
  text-align: center;
}
</style>
