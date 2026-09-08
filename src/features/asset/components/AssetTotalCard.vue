<script setup>
import { computed } from 'vue'

import BaseCard from '@/shared/components/atoms/base/card/BaseCard.vue'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'
import { formatNumber } from '@/shared/utils/formatter'

import assetIcon from '@/assets/images/assetIcon.png'
import refreshIcon from '@/assets/images/refreshIcon.png'

const props = defineProps({
  totalAssets: { type: Number, required: true },
  syncedAt: { type: String, default: null },
  isRefreshing: { type: Boolean, default: false },
})

defineEmits(['refresh'])

const amount = computed(() => formatNumber(props.totalAssets))

// 오늘이면 "오늘 HH:mm", 아니면 "MM.DD HH:mm"으로 표시
const syncedAtLabel = computed(() => {
  if (!props.syncedAt) return null

  const synced = new Date(props.syncedAt)
  const now = new Date()
  const time = synced.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const isToday = synced.toDateString() === now.toDateString()
  if (isToday) return `오늘 ${time}`
  return `${synced.getMonth() + 1}.${synced.getDate()} ${time}`
})
</script>

<template>
  <BaseCard class="asset-total-card">
    <!-- 글자는 왼쪽에 쌓고 버튼은 오른쪽 가운데. -->
    <div class="asset-total-card__info">
      <span class="asset-total-card__label">
        <img class="asset-total-card__label-icon" :src="assetIcon" alt="" />
        보유 골드 <span class="asset-total-card__label-sub">(총 자산)</span>
      </span>

      <p class="asset-total-card__amount">{{ amount }}</p>

      <span v-if="syncedAtLabel" class="asset-total-card__synced">
        마지막 동기화 · {{ syncedAtLabel }}
      </span>
    </div>

    <BaseButton
      variant="dark"
      class="asset-total-card__refresh-btn"
      :disabled="isRefreshing"
      @click="$emit('refresh')"
    >
      <img class="asset-total-card__refresh-icon" :src="refreshIcon" alt="" />
      {{ isRefreshing ? '동기화 중' : '동기화' }}
    </BaseButton>
  </BaseCard>
</template>

<style scoped>
/*
  이 화면에서 유일하게 색이 있는 카드다. 아래 아이템 목록이 전부 흰 카드라
  총액까지 흰색이면 어디가 제목인지 안 보인다.
  더 조용하게 하려면 background를 var(--c-card), border를 var(--c-line)로 바꾸면 된다.
*/
.asset-total-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--c-hero-line);
  border-radius: 14px;
  background: var(--c-hero-bg);
  line-height: 1.45;
}

.asset-total-card__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.asset-total-card__label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 700;
  color: var(--c-hero-ink);
}

.asset-total-card__label-icon {
  width: 12px;
  height: 12px;
  image-rendering: pixelated;
}

/* 원래 이름은 괄호 안에 작게.*/
.asset-total-card__label-sub {
  color: var(--c-hero-muted);
  font-weight: 400;
}

/* 숫자만 있는 줄이라 줄 높이를 더 붙인다. 위아래 여백이 눈에 띄게 줄어든다. */
.asset-total-card__amount {
  margin: 0;
  font-size: 26px;
  line-height: 1.1;
  font-weight: 700;
  color: var(--c-hero-ink);
  font-variant-numeric: tabular-nums;
}

.asset-total-card__synced {
  font-size: 11px;
  color: var(--c-hero-muted);
}

.asset-total-card :deep(.asset-total-card__refresh-btn) {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex: none;
  width: auto;
  height: 26px;
  padding: 0 10px;
  border: none;
  border-radius: 8px;
  background: var(--c-hero-btn-bg);
  color: var(--c-hero-btn-ink);
  font-size: 11px;
  font-weight: 400;
}

.asset-total-card :deep(.asset-total-card__refresh-btn:disabled) {
  opacity: 0.55;
}

.asset-total-card__refresh-icon {
  width: 11px;
  height: 11px;
  image-rendering: pixelated;
}
</style>
