<script setup>
import { computed } from 'vue'

import { formatTimeKo } from '@/shared/utils/formatter'

const props = defineProps({
  message: { type: Object, required: true },
  isMine: { type: Boolean, required: true },
})

const timeLabel = computed(() => formatTimeKo(props.message.createdAt))
</script>

<template>
  <div class="chat-message" :class="{ 'chat-message--mine': isMine }">
    <p class="chat-message__bubble">{{ message.content }}</p>
    <span class="chat-message__time">{{ timeLabel }}</span>
  </div>
</template>

<style scoped>
/* 부모(.consult-chat-view__messages)가 flex column이라, align-self로 좌/우 위치를
   정한다 - senderType이 아니라 isMine(현재 역할 기준)으로만 판단해서 USER/COUNSELOR
   화면이 같은 컴포넌트를 그대로 재사용할 수 있게 한다. */
.chat-message {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  align-self: flex-start;
  gap: 4px;
  max-width: 78%;
}

.chat-message--mine {
  align-items: flex-end;
  align-self: flex-end;
}

/* 새 채팅 전용 색을 만들지 않고, 기존 primary 버튼 색(내 메시지)과 카드 색(상대
   메시지)을 그대로 말풍선에 재사용한다. */
.chat-message__bubble {
  margin: 0;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 13.5px;
  line-height: 1.5;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  background: var(--color-surface, #161616);
  border: 1px solid var(--color-border, #262626);
  color: var(--color-text-primary, #ffffff);
  border-bottom-left-radius: 4px;
}

.chat-message--mine .chat-message__bubble {
  background: var(--base-button-primary-bg, #e3ffe8);
  border-color: transparent;
  color: var(--base-button-primary-text, #16281c);
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 4px;
}

.chat-message__time {
  padding: 0 4px;
  font-size: 10.5px;
  color: var(--color-text-tertiary, #6f766d);
}
</style>
