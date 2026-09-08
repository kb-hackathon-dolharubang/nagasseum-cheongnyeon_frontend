<script setup>
import { useRouter } from 'vue-router'

import AppHeader from '@/shared/components/molecules/AppHeader.vue'
import EmptyGoalCard from '@/features/home/components/EmptyGoalCard.vue'

const router = useRouter()
</script>

<template>
  <div class="goal-empty-view">
    <AppHeader title="목표" :show-back="false" />
    <EmptyGoalCard @create-goal="router.push('/diagnosis')" />
  </div>
</template>

<style scoped>
.goal-empty-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/*
  홈/비교/목표 상세 화면과 같은 card-rise 진입 모션(main.css에 공용 정의)을 재사용한다.
*/
.goal-empty-view > * {
  animation: card-rise 0.35s ease-out both;
}

.goal-empty-view > *:nth-child(2) {
  animation-delay: 0.06s;
}
</style>
