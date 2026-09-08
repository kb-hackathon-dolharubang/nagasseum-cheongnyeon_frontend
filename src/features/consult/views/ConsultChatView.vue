<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
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
  counselorConsultations,
  chatUserProfile,
} from '@/features/consult/data/counselors'
import { CONSULTATION_STATUS_META } from '@/features/consult/constants/status'
import { CURRENT_ROLE } from '@/features/consult/constants/role'
import { getConsultationMessages, sendConsultationMessage } from '@/features/consult/api/consultApi'

const props = defineProps({
  reservationId: { type: String, required: true },
})

const router = useRouter()

// route param을 한 번만 검증해서 이후 API 호출들이 전부 이 값을 쓴다 - 잘못된
// reservationId(숫자가 아니거나 0 이하)면 null로 두고 GET/POST/polling을 아예 시작하지
// 않는다.
const reservationIdNumber = computed(() => {
  const id = Number(props.reservationId)
  return Number.isInteger(id) && id > 0 ? id : null
})

// 상담사 홈(/counselor)에서 들어온 채팅만 router state로 viewerRole='COUNSELOR'를
// 넘긴다(예약 화면들이 category/consultationType을 넘기는 것과 같은 방식) - 그 값이
// 없으면(사용자 쪽 '내 상담 → 상담 입장' 흐름) 기존처럼 기본 역할(CURRENT_ROLE)로 본다.
// 이 화면 하나로 두 역할을 모두 표현할 수 있어야 해서, 이후 로직은 모두 이 값 하나만
// 기준으로 판단한다.
const currentRole = window.history.state?.viewerRole === 'COUNSELOR' ? 'COUNSELOR' : CURRENT_ROLE

// USER는 자신의 예약 목록(myConsultations)에서, COUNSELOR는 상담사 홈 목록
// (counselorConsultations)에서 같은 reservationId를 찾는다 - 두 목록에 겹치는
// reservationId(예: 2)는 같은 상담을 가리키므로 채팅 내용도 자연히 같이 이어진다.
// (이 조회는 상대방 이름/상담 상태 표시용으로만 쓰이는 기존 로직이라 이번 작업(메시지
// API 연동) 범위 밖이라 그대로 둔다.)
const reservation = computed(() => {
  if (!reservationIdNumber.value) return null
  const source = currentRole === 'COUNSELOR' ? counselorConsultations : myConsultations
  return source.find((item) => item.reservationId === reservationIdNumber.value) ?? null
})
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

// 상단 헤더에 보여줄 상대방. currentRole이 USER면 상담사가, COUNSELOR면 이 상담을
// 예약한 사용자가 상대다 - 이 값만 바뀌면 같은 ChatView를 두 역할이 그대로 재사용할
// 수 있다. 상담사 홈 목록에 없는 reservationId로 들어온 경우에만 데모용 기본 프로필
// (chatUserProfile)로 대체한다.
const opponent = computed(() => {
  if (currentRole === 'COUNSELOR') {
    const userName = reservation.value?.userName ?? chatUserProfile.name
    return { image: chatUserProfile.image, displayName: userName }
  }
  const name = counselor.value?.name ?? '상담사'
  return { image: counselor.value?.image ?? '', displayName: `${name} 상담사` }
})

/* ── 메시지 조회 / polling ─────────────────────────────────────
   Mock chatMessages 대신 실제 메시지 API를 쓴다(Mock 파일 자체는 다른 화면 확인용으로
   그대로 둔다). GET 응답 전체를 항상 최신 source of truth로 보고 배열을 통째로
   교체한다 - 별도 diff/merge 없이 그 자체로 polling 중복도 생기지 않는다. */

const messages = ref([])
const isLoadingMessages = ref(true)
const loadMessagesError = ref(false)

async function fetchMessages({ background = false } = {}) {
  if (!reservationIdNumber.value) return

  if (!background) isLoadingMessages.value = true
  const previousCount = messages.value.length

  try {
    const result = await getConsultationMessages(reservationIdNumber.value)
    messages.value = result ?? []
    loadMessagesError.value = false
    // polling 중에는 새 메시지가 실제로 늘어났을 때만 최신 메시지로 스크롤한다 -
    // 매번 강제로 내리지 않는다. 최초 진입 스크롤은 onMounted에서 따로 처리한다.
    if (background && messages.value.length > previousCount) {
      nextTick(scrollToBottom)
    }
  } catch {
    if (!background) loadMessagesError.value = true
  } finally {
    if (!background) isLoadingMessages.value = false
  }
}

let pollTimer = null
const POLL_INTERVAL_MS = 2500

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

onMounted(async () => {
  await fetchMessages()
  nextTick(scrollToBottom)

  // 채팅 화면에 있는 동안만 폴링한다 - 화면을 벗어나면 onBeforeUnmount에서 반드시 끈다.
  pollTimer = setInterval(() => fetchMessages({ background: true }), POLL_INTERVAL_MS)
})

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer)
})

const isSending = ref(false)
const sendError = ref('')

async function handleSend() {
  if (!canSend.value || isSending.value || !reservationIdNumber.value) return

  const content = draft.value.trim()
  isSending.value = true
  sendError.value = ''

  try {
    const sentMessage = await sendConsultationMessage(reservationIdNumber.value, {
      senderType: currentRole,
      content,
    })
    // polling이 같은 메시지를 먼저 가져왔을 수 있어 messageId로 한 번 더 확인한 뒤에만 추가한다.
    if (sentMessage && !messages.value.some((item) => item.messageId === sentMessage.messageId)) {
      messages.value.push(sentMessage)
    }
    draft.value = ''
    nextTick(scrollToBottom)
  } catch {
    // 실패하면 입력한 내용을 지우지 않는다(잃지 않기) - 화면에는 반영하지 않는다.
    sendError.value = '메시지를 보내지 못했습니다. 다시 시도해주세요.'
  } finally {
    isSending.value = false
  }
}

const isEndModalOpen = ref(false)

function handleEndConsultation() {
  // 실제 종료 API가 없어 화면 상태만 COMPLETED로 바꾼다(원본 myConsultations Mock은
  // 건드리지 않는다). 종료 후에는 AI 리포트 화면으로 넘어간다.
  status.value = 'COMPLETED'
  isEndModalOpen.value = false
  router.push({ name: 'consult-report', params: { reservationId: props.reservationId } })
}

// 사용자는 내 상담으로, 상담사는 상담사 홈으로 - 들어온 쪽으로 그대로 돌아간다.
function goBack() {
  if (currentRole === 'COUNSELOR') {
    router.push({ name: 'counselor-home' })
  } else {
    router.push({ name: 'consult-my' })
  }
}
</script>

<template>
  <div class="consult-chat-view">
    <AppHeader title-align="start" @back="goBack">
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
        <template v-if="messages.length">
          <template v-for="group in messageGroups" :key="group.dateKey">
            <div class="consult-chat-view__date-divider">
              <span>{{ formatMonthDayWeekdayKo(group.dateKey) }}</span>
            </div>
            <ChatMessage
              v-for="message in group.messages"
              :key="message.messageId"
              :message="message"
              :is-mine="message.senderType === currentRole"
            />
          </template>
        </template>
        <p v-else-if="loadMessagesError" class="consult-chat-view__notice-empty">
          메시지를 불러오지 못했어요.
        </p>
        <p v-else-if="!isLoadingMessages" class="consult-chat-view__notice-empty">
          상담을 시작해보세요.
        </p>
        <div ref="messagesEndRef" class="consult-chat-view__messages-end" />
      </div>

      <div class="consult-chat-view__composer">
        <p v-if="sendError" class="consult-chat-view__composer-error">{{ sendError }}</p>
        <form class="consult-chat-view__composer-row" @submit.prevent="handleSend">
          <template v-if="status !== 'COMPLETED'">
            <textarea
              v-model="draft"
              class="consult-chat-view__input"
              rows="1"
              placeholder="메시지를 입력해주세요"
              @keydown.enter.exact.prevent="handleSend"
            />
            <BaseButton type="submit" size="md" :disabled="!canSend || isSending">전송</BaseButton>
          </template>
          <p v-else class="consult-chat-view__ended-notice">상담이 종료되었습니다.</p>
        </form>
      </div>
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
  flex-direction: column;
  gap: 4px;
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

/* 입력창+전송 버튼 한 줄. sendError가 없을 때는 기존과 완전히 같은 모습이고,
   있을 때만 위에 에러 문구 한 줄이 추가된다. */
.consult-chat-view__composer-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.consult-chat-view__composer-error {
  margin: 0;
  font-size: 11.5px;
  text-align: center;
  color: var(--color-point, #c1442e);
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
