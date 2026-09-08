<script setup>
import BaseCard from '@/shared/components/atoms/base/card/BaseCard.vue'
import BaseBadge from '@/shared/components/atoms/base/badge/BaseBadge.vue'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'

defineEmits(['create-goal'])
</script>

<template>
  <div class="empty-goal">
    <h2 class="empty-goal__title">나의 목표</h2>
    <BaseCard class="empty-goal__card">
      <img src="@/assets/images/goal.png" alt="" class="empty-goal__icon" />
      <BaseBadge class="empty-goal__badge" variant="quest">NEW QUEST</BaseBadge>
      <p class="empty-goal__heading">아직 오를 정상이 없어요</p>
      <p class="empty-goal__desc">
        원하는 동네와 보증금 목표를 입력하면<br />현실적인 등반 계획을 만들어 드려요
      </p>
      <BaseButton class="empty-goal__cta" variant="primary" size="lg" @click="$emit('create-goal')"
        >＋ 목표 설정하기</BaseButton
      >
    </BaseCard>
  </div>
</template>

<style scoped>
.empty-goal {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-goal__title {
  font-size: 15px;
  font-weight: 900;
  color: var(--home-text-primary, #ffffff);
}

.empty-goal__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.empty-goal__icon {
  width: 30px;
  height: 30px;
  image-rendering: pixelated;
}

.empty-goal__heading {
  font-size: 16px;
  font-weight: 900;
  color: var(--home-text-primary, #ffffff);
}

.empty-goal__desc {
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.5;
  color: var(--color-text-secondary, #9aa09a);
}

.empty-goal :deep(.empty-goal__badge) {
  font-weight: 700;
}

.empty-goal :deep(.empty-goal__cta) {
  font-weight: 900;
}
</style>
