<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppHeader from '@/shared/components/molecules/AppHeader.vue'
import CounselorConsultationCard from '@/features/counselor/components/CounselorConsultationCard.vue'
import { CURRENT_COUNSELOR_ID } from '@/features/consult/constants/role'
import { CATEGORY_FROM_API_VALUES } from '@/features/consult/constants/categories'
import { getCounselorConsultations } from '@/features/consult/api/consultApi'

const router = useRouter()

function toDateKey(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const todayKey = toDateKey(new Date())

/* ── 예약된 상담 목록 조회 ─────────────────────────────────────
   원래는 Mock counselorConsultations를 counselorId로 필터링했지만, 이제 실제 API
   응답을 같은 모양으로 다듬어 그 자리에 채운다 - 아래 정렬/분류 computed는 손대지 않는다.
   ConsultMyView.loadConsultations()와 같은 패턴. */

const myReservations = ref([])
const isLoading = ref(true)
const loadError = ref(false)

async function loadReservations() {
  isLoading.value = true
  loadError.value = false

  try {
    const items = await getCounselorConsultations(CURRENT_COUNSELOR_ID)
    myReservations.value = (items ?? []).map((item) => ({
      reservationId: item.reservationId,
      userName: item.userName,
      // API의 category는 백엔드 enum(GOAL/ASSET 등)이라, 카드가 쓰는 프론트 내부
      // 코드(GOAL_SETTING/ASSET_MANAGEMENT 등)로 되돌려야 기존 라벨 변환이 그대로 맞는다.
      category: CATEGORY_FROM_API_VALUES[item.category] ?? item.category,
      reservationDate: item.reservationDate,
      // "14:00:00" -> "14:00". 새 날짜 라이브러리 없이 앞 5글자만 쓴다.
      reservationTime: (item.reservationTime ?? '').slice(0, 5),
      status: item.status,
    }))
  } catch {
    loadError.value = true
    myReservations.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(loadReservations)

function toSortableDateTime(item) {
  return `${item.reservationDate}T${item.reservationTime}`
}

const inProgressReservations = computed(() =>
  myReservations.value
    .filter((item) => item.status === 'IN_PROGRESS')
    .slice()
    .sort((a, b) => toSortableDateTime(a).localeCompare(toSortableDateTime(b))),
)

const todayReservations = computed(() =>
  myReservations.value
    .filter((item) => item.status === 'RESERVED' && item.reservationDate === todayKey)
    .slice()
    .sort((a, b) => toSortableDateTime(a).localeCompare(toSortableDateTime(b))),
)

const upcomingReservations = computed(() =>
  myReservations.value
    .filter((item) => item.status === 'RESERVED' && item.reservationDate > todayKey)
    .slice()
    .sort((a, b) => toSortableDateTime(a).localeCompare(toSortableDateTime(b))),
)

// 상담 입장은 기존 공통 채팅 화면을 그대로 쓰되, 이 화면에서 들어왔다는 걸 router
// state로 넘겨 채팅 화면이 상담사(COUNSELOR) 시점으로 렌더링되게 한다 - 예약 화면들이
// category/consultationType을 넘기는 것과 같은 방식이라 새 인증/권한 체계가 필요 없다.
function goToChat(reservationId) {
  router.push({
    name: 'consult-chat',
    params: { reservationId },
    state: { viewerRole: 'COUNSELOR' },
  })
}
</script>

<template>
  <div class="counselor-home-view">
    <AppHeader title="상담 관리" :show-back="false" />
    <p class="counselor-home-view__intro">예약된 상담 일정을 확인해보세요.</p>

    <section v-if="inProgressReservations.length" class="counselor-home-view__section">
      <h2 class="counselor-home-view__section-title">진행 중인 상담</h2>
      <div class="counselor-home-view__list">
        <CounselorConsultationCard
          v-for="item in inProgressReservations"
          :key="item.reservationId"
          :reservation-id="item.reservationId"
          :user-name="item.userName"
          :category="item.category"
          :reservation-date="item.reservationDate"
          :reservation-time="item.reservationTime"
          :status="item.status"
          @enter-chat="goToChat"
        />
      </div>
    </section>

    <section class="counselor-home-view__section">
      <h2 class="counselor-home-view__section-title">오늘의 상담</h2>
      <div v-if="todayReservations.length" class="counselor-home-view__list">
        <CounselorConsultationCard
          v-for="item in todayReservations"
          :key="item.reservationId"
          :reservation-id="item.reservationId"
          :user-name="item.userName"
          :category="item.category"
          :reservation-date="item.reservationDate"
          :reservation-time="item.reservationTime"
          :status="item.status"
          @enter-chat="goToChat"
        />
      </div>
      <p v-else-if="!isLoading" class="counselor-home-view__empty-text">
        {{ loadError ? '상담 목록을 불러오지 못했습니다.' : '오늘 예정된 상담이 없습니다.' }}
      </p>
    </section>

    <section class="counselor-home-view__section">
      <h2 class="counselor-home-view__section-title">다가오는 상담</h2>
      <div v-if="upcomingReservations.length" class="counselor-home-view__list">
        <CounselorConsultationCard
          v-for="item in upcomingReservations"
          :key="item.reservationId"
          :reservation-id="item.reservationId"
          :user-name="item.userName"
          :category="item.category"
          :reservation-date="item.reservationDate"
          :reservation-time="item.reservationTime"
          :status="item.status"
          show-date
          :show-cta="false"
          @enter-chat="goToChat"
        />
      </div>
      <p v-else-if="!isLoading" class="counselor-home-view__empty-text">
        {{ loadError ? '상담 목록을 불러오지 못했습니다.' : '다가오는 상담이 없습니다.' }}
      </p>
    </section>
  </div>
</template>

<style scoped>
.counselor-home-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.counselor-home-view__intro {
  margin: -8px 4px 0;
  font-size: 13px;
  color: var(--color-text-secondary, #9aa09a);
}

.counselor-home-view__section {
  display: flex;
  flex-direction: column;
}

.counselor-home-view__section-title {
  margin: 0 0 8px;
  padding: 0 4px;
  font-size: 14.5px;
  font-weight: 600;
  color: var(--color-text-secondary, #9aa09a);
}

.counselor-home-view__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.counselor-home-view__empty-text {
  padding: 24px 0;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-secondary, #9aa09a);
}
</style>
