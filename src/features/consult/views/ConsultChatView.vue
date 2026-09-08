<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppHeader from '@/shared/components/molecules/AppHeader.vue'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'
import BaseBadge from '@/shared/components/atoms/base/badge/BaseBadge.vue'
import BaseModal from '@/shared/components/atoms/feedback/Modal/BaseModal.vue'
import ChatMessage from '@/features/consult/components/ChatMessage.vue'
import { formatMonthDayWeekdayKo } from '@/shared/utils/formatter'
import {
  counselors,
  myConsultations,
  chatMessages,
  chatUserProfile,
} from '@/features/consult/data/counselors'
import { CONSULTATION_STATUS_META } from '@/features/consult/constants/status'
import { CURRENT_ROLE } from '@/features/consult/constants/role'

const props = defineProps({
  reservationId: { type: String, required: true },
})

const router = useRouter()

const reservation = computed(
  () => myConsultations.find((item) => item.reservationId === Number(props.reservationId)) ?? null,
)
const counselor = computed(() =>
  reservation.value
    ? (counselors.find((item) => item.id === reservation.value.counselorId) ?? null)
    : null,
)

// 내 상담 목록에서 어떤 상태로 들어왔든(RESERVED에서 '상담 입장'을 눌러도) 채팅방에
// 들어온 순간은 진행 중으로 본다. 이미 COMPLETED인 상담(리포트에서 되돌아온 경우 등)만
// 읽기 전용으로 유지한다. 실제 상태 변경 API가 없어 화면 로컬 상태로만 관리한다.
const status = ref(reservation.value?.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS')
const statusMeta = computed(() => CONSULTATION_STATUS_META[status.value])

// 상단 헤더에 보여줄 상대방. currentRole이 USER면 상담사가, COUNSELOR면 사용자가
// 상대다 - 이 값만 바뀌면 같은 ChatView를 두 역할이 그대로 재사용할 수 있다.
const opponent = computed(() => {
  if (CURRENT_ROLE === 'COUNSELOR') {
    return { image: chatUserProfile.image, displayName: chatUserProfile.name }
  }
  const name = counselor.value?.name ?? '상담사'
  return { image: counselor.value?.image ?? '', displayName: `${name} 상담사` }
})

// 원본 Mock(chatMessages)은 그대로 두고, 이 화면에서 주고받는 메시지는 복사본에서만
// 다룬다 - 다른 상담 화면들의 consultationData와 같은 원칙.
const messages = ref([...(chatMessages[Number(props.reservationId)] ?? [])])

function toDateKey(createdAt) {
  return createdAt.slice(0, 10)
}

// 날짜가 바뀔 때만 구분선을 새로 만든다. Mock 메시지가 모두 같은 날짜면 구분선은
// 한 번만 표시된다 - 복잡한 그룹핑 없이 순서대로 훑으며 직전 그룹과 날짜만 비교한다.
const messageGroups = computed(() => {
  const groups = []
  for (const message of messages.value) {
    const dateKey = toDateKey(message.createdAt)
    const lastGroup = groups[groups.length - 1]
    if (lastGroup?.dateKey === dateKey) {
      lastGroup.messages.push(message)
    } else {
      groups.push({ dateKey, messages: [message] })
    }
  }
  return groups
})

const draft = ref('')
const canSend = computed(() => status.value !== 'COMPLETED' && draft.value.trim().length > 0)

const messagesEndRef = ref(null)
function scrollToBottom() {
  messagesEndRef.value?.scrollIntoView({ block: 'end' })
}

onMounted(() => {
  scrollToBottom()
})

function handleSend() {
  if (!canSend.value) return

  const nextId = messages.value.length
    ? Math.max(...messages.value.map((item) => item.messageId)) + 1
    : 1

  messages.value.push({
    messageId: nextId,
    senderType: CURRENT_ROLE,
    content: draft.value.trim(),
    createdAt: new Date().toISOString(),
  })
  draft.value = ''
  nextTick(scrollToBottom)
}

const isEndModalOpen = ref(false)

function handleEndConsultation() {
  // 실제 종료 API가 없어 화면 상태만 COMPLETED로 바꾼다(원본 myConsultations Mock은
  // 건드리지 않는다). 종료 후에는 AI 리포트 화면으로 넘어간다.
  status.value = 'COMPLETED'
  isEndModalOpen.value = false
  router.push({ name: 'consult-report', params: { reservationId: props.reservationId } })
}

function goToMyConsultations() {
  router.push({ name: 'consult-my' })
}
</script>

<template>
  <div class="consult-chat-view">
    <AppHeader title-align="start" @back="goToMyConsultations">
      <template #title>
        <div class="consult-chat-view__opponent">
          <div class="consult-chat-view__avatar">
            <img
              v-if="opponent.image"
              class="consult-chat-view__avatar-img"
              :src="opponent.image"
              alt=""
            />
            <span v-else class="consult-chat-view__avatar-fallback">{{
              opponent.displayName.charAt(0)
            }}</span>
          </div>
          <p class="consult-chat-view__opponent-name">{{ opponent.displayName }}</p>
          <BaseBadge :variant="statusMeta.badgeVariant">{{ statusMeta.label }}</BaseBadge>
        </div>
      </template>
      <template #action>
        <BaseButton
          class="consult-chat-view__end-button"
          variant="text"
          @click="isEndModalOpen = true"
        >
          상담 종료
        </BaseButton>
      </template>
    </AppHeader>

    <template v-if="reservation">
      <div class="consult-chat-view__messages">
        <template v-for="group in messageGroups" :key="group.dateKey">
          <div class="consult-chat-view__date-divider">
            <span>{{ formatMonthDayWeekdayKo(group.dateKey) }}</span>
          </div>
          <ChatMessage
            v-for="message in group.messages"
            :key="message.messageId"
            :message="message"
            :is-mine="message.senderType === CURRENT_ROLE"
          />
        </template>
        <div ref="messagesEndRef" class="consult-chat-view__messages-end" />
      </div>

      <form class="consult-chat-view__composer" @submit.prevent="handleSend">
        <template v-if="status !== 'COMPLETED'">
          <textarea
            v-model="draft"
            class="consult-chat-view__input"
            rows="1"
            placeholder="메시지를 입력해주세요"
            @keydown.enter.exact.prevent="handleSend"
          />
          <BaseButton type="submit" size="md" :disabled="!canSend">전송</BaseButton>
        </template>
        <p v-else class="consult-chat-view__ended-notice">상담이 종료되었습니다.</p>
      </form>
    </template>

    <p v-else class="consult-chat-view__notice-empty">상담 정보를 찾을 수 없어요.</p>

    <BaseModal v-model="isEndModalOpen" title="상담을 종료하시겠습니까?">
      <p class="consult-chat-view__modal-desc">
        상담을 종료하면 채팅 내용이 상담 리포트 생성에 활용됩니다.
      </p>
      <template #footer>
        <BaseButton variant="secondary" @click="isEndModalOpen = false">취소</BaseButton>
        <BaseButton variant="primary" @click="handleEndConsultation">상담 종료</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.consult-chat-view {
  display: flex;
  flex-direction: column;
}

/* ── 헤더 상대방 정보 ──────────────────────────────────────── */

.consult-chat-view__opponent {
  display: flex;
  align-items: center;
  gap: 8px;
  /* 헤더 가운데 칸이 1fr(가변 폭)이라, flex 기본값(min-width: auto)만으로는 이름이
     길어질 때 상담 종료 버튼 쪽으로 넘칠 수 있어 명시적으로 줄인다. */
  min-width: 0;
}

.consult-chat-view__avatar {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  overflow: hidden;
  border-radius: 18px;
  background: var(--color-surface-soft, #cdedd3);
}

.consult-chat-view__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.consult-chat-view__avatar-fallback {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-primary, #1d6b3f);
}

.consult-chat-view__opponent-name {
  flex: 0 1 auto;
  min-width: 0;
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 일반 보조 텍스트(tertiary 회색)와 구분되도록 기존 브랜드 색(--color-primary)을
   그대로 재사용한다 - Primary 버튼처럼 배경을 채우진 않아 상담사 이름(14px)보다
   강하게 보이지 않으면서도, 누를 수 있는 액션이라는 게 더 잘 드러난다. */
.consult-chat-view__end-button {
  color: var(--color-primary, #1d6b3f);
}

/* ── 메시지 영역 ───────────────────────────────────────────── */

.consult-chat-view__messages {
  display: flex;
  flex-direction: column;
  gap: 10px;
  /* 하단 입력창이 position: fixed로 화면에 떠 있어 문서 흐름에서 빠지는 만큼,
     마지막 메시지가 그 뒤에 가리지 않도록 입력창 높이(+ safe area)만큼 여백을
     미리 남겨둔다. */
  padding: 12px 2px calc(84px + env(safe-area-inset-bottom, 0px));
}

.consult-chat-view__date-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 4px 0;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--color-text-tertiary, #6f766d);
}

.consult-chat-view__messages-end {
  height: 1px;
}

.consult-chat-view__notice-empty {
  padding: 48px 0;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-secondary, #9aa09a);
}

/* ── 입력 영역 ─────────────────────────────────────────────── */
/* 메시지가 몇 개뿐이라 화면을 다 못 채울 때도 항상 화면 하단에 붙어 있어야 해서
   sticky가 아니라 fixed로 고정한다(sticky는 스크롤로 그 지점을 지나야만 붙는다).
   MobileLayout의 하단 GNB(.mobile-layout__nav)와 같은 방식으로 뷰포트 기준
   가운데 정렬하되, GNB(플로팅 pill)와 달리 이 화면의 다른 콘텐츠와 같은 좌우
   16px 패딩 폭(모바일 컨테이너 400px - 32px)에 맞춘다. */
.consult-chat-view__composer {
  position: fixed;
  bottom: 0;
  left: 50%;
  z-index: 8;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  width: calc(100% - 32px);
  max-width: 368px;
  box-sizing: border-box;
  /* 다른 하단 고정 영역(BaseBottomSheet 등)과 같은 방식으로 iOS 하단 홈 인디케이터
     영역만큼 여백을 더한다 - 값이 없는 기기/브라우저에서는 기존처럼 12px만 남는다. */
  padding: 10px 0 calc(12px + env(safe-area-inset-bottom, 0px));
  background: var(--color-app-bg, #111111);
  border-top: 1px solid var(--color-border, #262626);
  transform: translateX(-50%);
}

.consult-chat-view__input {
  flex: 1;
  box-sizing: border-box;
  min-height: 44px;
  max-height: 120px;
  padding: 12px 14px;
  border: 1px solid var(--color-border, #262626);
  border-radius: 15px;
  background: var(--color-surface, #161616);
  color: var(--color-text-primary, #ffffff);
  font: inherit;
  font-size: 13.5px;
  line-height: 1.4;
  resize: none;
}

.consult-chat-view__input::placeholder {
  color: var(--color-text-tertiary, #6f766d);
}

.consult-chat-view__ended-notice {
  flex: 1;
  margin: 0;
  padding: 12px 0;
  text-align: center;
  font-size: 12.5px;
  color: var(--color-text-tertiary, #6f766d);
}

/* ── 상담 종료 모달 ────────────────────────────────────────── */

.consult-chat-view__modal-desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-text-secondary, #4b564e);
}
</style>
