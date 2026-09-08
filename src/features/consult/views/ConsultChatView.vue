<script setup>
import { useRouter } from 'vue-router'

import AppHeader from '@/shared/components/molecules/AppHeader.vue'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'

// 채팅 화면 자체는 이번 범위 밖이라, 내 상담 카드의 '상담 입장'/'상담 계속하기'가
// 향할 라우트만 미리 준비해두는 placeholder다.
const router = useRouter()

function goToMyConsultations() {
  router.push({ name: 'consult-my' })
}
</script>

<template>
  <div class="consult-chat-view">
    <AppHeader title="상담" @back="goToMyConsultations" />

    <div class="consult-chat-view__body">
      <p class="consult-chat-view__title">채팅 상담 화면을 준비 중이에요</p>
      <p class="consult-chat-view__desc">
        곧 이곳에서 상담사와 실시간으로 대화할 수 있게 될 예정이에요.
      </p>
      <BaseButton size="lg" @click="goToMyConsultations">내 상담으로 돌아가기</BaseButton>
    </div>
  </div>
</template>

<style scoped>
.consult-chat-view {
  display: flex;
  flex-direction: column;
}

.consult-chat-view__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 64px 16px;
  text-align: center;
}

.consult-chat-view__title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.consult-chat-view__desc {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--color-text-secondary, #9aa09a);
}
</style>
