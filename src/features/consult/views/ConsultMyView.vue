<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppHeader from '@/shared/components/molecules/AppHeader.vue'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'
import ConsultationCard from '@/features/consult/components/ConsultationCard.vue'
import { useAuthStore } from '@/features/auth'
import { counselors } from '@/features/consult/data/counselors'
import { CATEGORY_FROM_API_VALUES } from '@/features/consult/constants/categories'
import { getUserConsultations } from '@/features/consult/api/consultApi'

const router = useRouter()
const authStore = useAuthStore()

function findCounselor(counselorId) {
  return counselors.find((item) => item.id === counselorId) ?? null
}

/* ── 내 상담 목록 조회 ─────────────────────────────────────────
   원래는 Mock myConsultations를 그대로 필터링했지만, 이제 실제 API 응답을 같은
   모양으로 다듬어 그 자리에 채운다 - 아래 정렬/분류 computed는 손대지 않는다. */

const consultations = ref([])
const isLoading = ref(true)
const loadError = ref(false)

async function loadConsultations() {
  // 예약 생성 때와 같은 규칙(실제 로그인 memberId -> 없으면 로컬 개발용
  // VITE_DEV_MEMBER_ID)을 그대로 재사용한다 - 이 화면에서 새로 만들지 않는다.
  const memberId = authStore.currentMemberId
  if (!memberId) {
    console.error(
      '[내 상담] 현재 사용자 ID를 확인할 수 없습니다. 로그인 상태 또는 VITE_DEV_MEMBER_ID(.env.local)를 확인해주세요.',
    )
    isLoading.value = false
    return
  }

  isLoading.value = true
  loadError.value = false

  try {
    const items = await getUserConsultations(memberId)
    consultations.value = (items ?? []).map((item) => ({
      reservationId: item.reservationId,
      counselorId: item.counselorId,
      // API의 category는 백엔드 enum(GOAL/ASSET 등)이라, 화면이 쓰는 프론트 내부
      // 코드(GOAL_SETTING/ASSET_MANAGEMENT 등)로 되돌려야 기존 라벨 변환이 그대로 맞는다.
      category: CATEGORY_FROM_API_VALUES[item.category] ?? item.category,
      reservationDate: item.reservationDate,
      // "10:00:00" -> "10:00". 새 날짜 라이브러리 없이 앞 5글자만 쓴다.
      reservationTime: (item.reservationTime ?? '').slice(0, 5),
      status: item.status,
    }))
  } catch {
    loadError.value = true
    consultations.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(loadConsultations)

// "2026-09-09" + "14:00" -> "2026-09-09T14:00"으로 합쳐 문자열 비교만으로 시간순 정렬한다.
function toSortableDateTime(item) {
  return `${item.reservationDate}T${item.reservationTime}`
}

// 예정된 상담: 가장 가까운 상담이 위로 오도록 오름차순.
const upcomingConsultations = computed(() =>
  consultations.value
    .filter((item) => item.status === 'RESERVED' || item.status === 'IN_PROGRESS')
    .slice()
    .sort((a, b) => toSortableDateTime(a).localeCompare(toSortableDateTime(b))),
)

// 지난 상담: 가장 최근에 완료된 상담이 위로 오도록 내림차순.
const pastConsultations = computed(() =>
  consultations.value
    .filter((item) => item.status === 'COMPLETED')
    .slice()
    .sort((a, b) => toSortableDateTime(b).localeCompare(toSortableDateTime(a))),
)

function goToConsultHome() {
  router.push({ name: 'consult' })
}

function goToChat(reservationId) {
  router.push({ name: 'consult-chat', params: { reservationId } })
}

function goToReport(reservationId) {
  router.push({ name: 'consult-report', params: { reservationId } })
}
</script>

<template>
  <div class="consult-my-view">
    <AppHeader title="내 상담" @back="goToConsultHome" />

    <section class="consult-my-view__section">
      <h2 class="consult-my-view__section-title">예정된 상담</h2>

      <div v-if="upcomingConsultations.length" class="consult-my-view__list">
        <ConsultationCard
          v-for="item in upcomingConsultations"
          :key="item.reservationId"
          :reservation-id="item.reservationId"
          :counselor="findCounselor(item.counselorId)"
          :category="item.category"
          :reservation-date="item.reservationDate"
          :reservation-time="item.reservationTime"
          :status="item.status"
          @enter-chat="goToChat"
          @view-report="goToReport"
        />
      </div>

      <template v-else-if="!isLoading">
        <div v-if="loadError" class="consult-my-view__empty">
          <p class="consult-my-view__empty-title">상담 목록을 불러오지 못했습니다.</p>
          <p class="consult-my-view__empty-desc">잠시 후 다시 시도해주세요.</p>
        </div>
        <div v-else class="consult-my-view__empty">
          <p class="consult-my-view__empty-title">예정된 상담이 없습니다.</p>
          <p class="consult-my-view__empty-desc">상담사를 찾아 나에게 맞는 상담을 예약해보세요.</p>
          <BaseButton variant="text" @click="goToConsultHome">상담사 보기 ›</BaseButton>
        </div>
      </template>
    </section>

    <section class="consult-my-view__section">
      <h2 class="consult-my-view__section-title">지난 상담</h2>

      <div v-if="pastConsultations.length" class="consult-my-view__list">
        <ConsultationCard
          v-for="item in pastConsultations"
          :key="item.reservationId"
          :reservation-id="item.reservationId"
          :counselor="findCounselor(item.counselorId)"
          :category="item.category"
          :reservation-date="item.reservationDate"
          :reservation-time="item.reservationTime"
          :status="item.status"
          @view-report="goToReport"
        />
      </div>

      <p v-else-if="!isLoading" class="consult-my-view__empty-text">
        {{ loadError ? '지난 상담을 불러오지 못했습니다.' : '아직 완료된 상담이 없습니다.' }}
      </p>
    </section>
  </div>
</template>

<style scoped>
.consult-my-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.consult-my-view__section {
  display: flex;
  flex-direction: column;
}

.consult-my-view__section-title {
  margin: 0 0 8px;
  padding: 0 4px;
  font-size: 14.5px;
  font-weight: 600;
  color: var(--color-text-secondary, #9aa09a);
}

.consult-my-view__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ── Empty state ───────────────────────────────────────────── */
/* 상담사 목록이 비었을 때 쓰는 ConsultView__empty와 같은 언어(가운데 정렬, secondary 텍스트)를
   따르되, 예정된 상담 섹션은 안내 문구 + CTA가 더 있어 카드 형태로만 키를 맞춘다. */

.consult-my-view__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 28px 16px;
  text-align: center;
}

.consult-my-view__empty-title {
  margin: 0;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.consult-my-view__empty-desc {
  margin: 0 0 4px;
  font-size: 12.5px;
  color: var(--color-text-secondary, #9aa09a);
}

.consult-my-view__empty-text {
  padding: 24px 0;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-secondary, #9aa09a);
}
</style>
