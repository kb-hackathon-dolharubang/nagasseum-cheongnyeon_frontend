<script setup>
import BaseBadge from '@/shared/components/atoms/base/badge/BaseBadge.vue'

defineProps({
  member: { type: Object, required: true },
})
</script>

<template>
  <!--
    알림 벨을 뺐다. 알림 기능이 없어져서 눌러도 아무 일이 없는 버튼만 남아 있었다.
    (프론트 점검 목록 1번) 기능이 생기면 다시 넣으면 된다.
  -->
  <div class="greeting-header">
    <span class="greeting-header__hello">안녕하세요, {{ member.nickname }} 님</span>
    <BaseBadge class="greeting-header__badge" variant="mint"
      >Lv.{{ member.level }} {{ member.levelTitle }}</BaseBadge
    >
  </div>
</template>

<style scoped>
/* 벨이 빠져 오른쪽이 비었다. 가운데로 모아야 한쪽으로 쏠려 보이지 않는다. */
.greeting-header {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  min-width: 0;
}

.greeting-header__hello {
  overflow: hidden;
  font-family: var(--sans-normal);
  font-size: 20px;
  font-weight: 900;
  color: var(--home-text-primary, #ffffff);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.greeting-header :deep(.greeting-header__badge) {
  font-weight: 700;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}
</style>
