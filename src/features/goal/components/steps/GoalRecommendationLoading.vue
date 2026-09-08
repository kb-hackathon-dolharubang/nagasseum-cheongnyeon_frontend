<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

import BaseClimbingLoader from '@/shared/components/atoms/feedback/ClimbingLoader/BaseClimbingLoader.vue'

// 실제 추천 계산은 4개 알고리즘이 각각 실거래를 훑어서 수 초가 걸릴 수 있다.
// 한 문장만 띄워두면 멈춘 것처럼 보여서, 지금 무슨 일이 일어나는지 순서대로 바꿔 보여준다.
const MESSAGES = [
  '입력하신 조건을 정리하고 있어요',
  '그 지역 실거래가를 살펴보는 중이에요',
  '지금 자산으로 갈 수 있는 길을 계산하고 있어요',
  '거의 다 됐어요',
]

const messageIndex = ref(0)
let timer = null

onMounted(() => {
  timer = setInterval(() => {
    // 마지막 문구에 도달하면 거기서 멈춘다 — 계속 돌면 진행되지 않는 느낌을 준다.
    if (messageIndex.value < MESSAGES.length - 1) messageIndex.value += 1
  }, 1600)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="goal-recommendation-loading">
    <BaseClimbingLoader />

    <div class="goal-recommendation-loading__text">
      <h2 class="goal-recommendation-loading__title">조건에 맞는 목표를<br />찾고 있어요</h2>
      <!-- key를 바꿔 문구가 교체될 때마다 페이드 인이 다시 실행되게 한다 -->
      <p :key="messageIndex" class="goal-recommendation-loading__message">
        {{ MESSAGES[messageIndex] }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.goal-recommendation-loading {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 40px;
  min-height: 60vh;
  padding: 40px 0;
  text-align: center;
}

.goal-recommendation-loading__text {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.goal-recommendation-loading__title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: -0.5px;
  color: var(--color-text-primary, #ffffff);
}

.goal-recommendation-loading__message {
  margin: 0;
  font-size: 13.2px;
  color: var(--color-text-secondary, #9aa09a);
  animation: goal-loading-fade 0.5s ease;
}

@keyframes goal-loading-fade {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 모션 민감 사용자를 위해 메시지 페이드는 끈다. 캐릭터/진행바는 BaseClimbingLoader가 처리한다. */
@media (prefers-reduced-motion: reduce) {
  .goal-recommendation-loading__message {
    animation: none;
  }
}
</style>
