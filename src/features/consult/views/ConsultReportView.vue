<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppHeader from '@/shared/components/molecules/AppHeader.vue'
import BaseCard from '@/shared/components/atoms/base/card/BaseCard.vue'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'
import BaseClimbingLoader from '@/shared/components/atoms/feedback/BaseClimbingLoader.vue'
import BaseChevronIcon from '@/shared/components/atoms/base/icon/BaseChevronIcon.vue'
import ConsultationInfoCard from '@/features/consult/components/ConsultationInfoCard.vue'
import { counselors } from '@/features/consult/data/counselors'
import {
  CATEGORY_FROM_API_VALUES,
  getCategorySubjectLabel,
} from '@/features/consult/constants/categories'
import { buildConsultInfo } from '@/features/consult/utils/consultInfo'
import { formatMonthDayWeekdayKo } from '@/shared/utils/formatter'
import { fetchActiveGoal } from '@/features/goal/api/goalApi'
import { useAuthStore } from '@/features/auth'
import { getUserConsultations, getConsultationReport } from '@/features/consult/api/consultApi'

const props = defineProps({
  reservationId: { type: String, required: true },
})

const router = useRouter()
const authStore = useAuthStore()

/* ── 예약 정보 조회 ────────────────────────────────────────────
   ConsultMyView와 같은 방식(getUserConsultations)으로 실제 백엔드에서 내 상담
   목록을 받아 reservationId로 찾는다 - 단건 조회 API가 없어 목록에서 찾는 것도
   ConsultChatView와 동일하다. */

const reservation = ref(null)
const isLoadingReservation = ref(true)

async function loadReservation() {
  const memberId = authStore.currentMemberId
  if (!memberId) {
    isLoadingReservation.value = false
    return
  }

  isLoadingReservation.value = true
  try {
    const items = await getUserConsultations(memberId)
    const found = (items ?? []).find((item) => item.reservationId === Number(props.reservationId))
    reservation.value = found
      ? { ...found, category: CATEGORY_FROM_API_VALUES[found.category] ?? found.category }
      : null
  } catch {
    reservation.value = null
  } finally {
    isLoadingReservation.value = false
  }
}

const counselor = computed(() =>
  reservation.value
    ? (counselors.find((item) => item.id === reservation.value.counselorId) ?? null)
    : null,
)

// "상담 기준 정보"는 AI가 새로 추론하는 값이 아니라, 상담 예약 2단계와 똑같은 방식으로
// 기존 두 원본 Mock(recentDiagnosisGoal/generalConsultInfo)에서 그대로 가져온다.
const consultInfo = computed(() =>
  reservation.value ? buildConsultInfo(reservation.value.consultationType) : null,
)

const subjectLabel = computed(() => getCategorySubjectLabel(reservation.value?.category))
const scheduleLabel = computed(() =>
  reservation.value ? formatMonthDayWeekdayKo(reservation.value.reservationDate) : '',
)

/* ── 리포트 조회 ───────────────────────────────────────────────
   실제 리포트 생성 API가 아직 없어 이 호출은 MSW mock(consultHandlers.js)이 응답한다. */

const report = ref(null)
const reportStatus = ref('GENERATING')

async function loadReport() {
  reportStatus.value = 'GENERATING'
  try {
    const result = await getConsultationReport(props.reservationId)
    report.value = result
    reportStatus.value = result?.status ?? 'FAILED'
  } catch {
    report.value = null
    reportStatus.value = 'FAILED'
  }
}

function handleRetryGenerate() {
  loadReport()
}

onMounted(() => {
  loadReservation()
  loadReport()
})

/* ── 바로가기 ──────────────────────────────────────────────────
   예전엔 AI 리포트 응답의 nextActions를 그대로 렌더링했지만, 이제 리포트 구조에서
   nextActions가 빠져서 대신 상담의 category(reservation, 리포트 생성 여부와 무관하게
   항상 있는 값)를 기준으로 고정된 바로가기를 보여준다. */

// 저축 전용 화면이 따로 없고 월 저축 조정도 목표 상세 화면 안에서 이뤄지므로
// SAVING/HOUSING 모두 목표 상세로 보낸다. goal-detail/goal-edit 모두 목표가 없으면
// goal-empty로 보내는 규칙이 같아 라우트 이름만 다르게 받는다.
async function goToActiveGoal(routeName) {
  try {
    const activeGoal = await fetchActiveGoal()
    if (activeGoal) {
      router.push({ name: routeName, params: { goalId: activeGoal.goalId } })
    } else {
      router.push({ name: 'goal-empty' })
    }
  } catch {
    router.push({ name: 'goal-empty' })
  }
}

const goToGoal = () => goToActiveGoal('goal-detail')
const goToGoalEdit = () => goToActiveGoal('goal-edit')

function goToAsset() {
  router.push({ name: 'asset-detail' })
}

function goToPolicy() {
  router.push({ name: 'policy' })
}

// 카테고리별 고정 바로가기. 실제로 이동할 화면이 있는 카테고리만 등록한다.
const CATEGORY_NEXT_STEPS = {
  GOAL_SETTING: [
    {
      title: '목표를 다시 설정해보세요',
      description: '상담 내용을 반영해 목표 조건을 수정할 수 있어요.',
      label: '목표 수정하기',
      handler: goToGoalEdit,
    },
  ],
  SAVING: [
    {
      title: '저축 계획을 확인해보세요',
      description: '현재 월 저축액이 목표에 적절한지 다시 확인해보세요.',
      label: '내 목표 보러 가기',
      handler: goToGoal,
    },
  ],
  HOUSING: [
    {
      title: '목표 조건을 확인해보세요',
      description: '상담에서 나온 주거 조건이 목표에 반영됐는지 확인해보세요.',
      label: '내 목표 보러 가기',
      handler: goToGoal,
    },
  ],
  ASSET_MANAGEMENT: [
    {
      title: '내 자산을 확인해보세요',
      description: '상담에서 다룬 자산 구성을 다시 살펴보세요.',
      label: '내 자산 확인하기',
      handler: goToAsset,
    },
  ],
  LOAN: [
    {
      title: '맞춤 정책을 확인해보세요',
      description: '현재 조건에서 활용 가능한 대출·정책이 있는지 확인해보세요.',
      label: '맞춤 정책 확인하기',
      handler: goToPolicy,
    },
  ],
}

const nextSteps = computed(() => CATEGORY_NEXT_STEPS[reservation.value?.category] ?? [])

// 종료된 채팅 화면으로 다시 돌아가지 않도록 router.back()이 아니라 내 상담으로
// 직접 이동한다. 리포트 화면 자체는 항상 뒤로가기로 여기(내 상담)로 나가면 된다.
function goToMyConsultations() {
  router.push({ name: 'consult-my' })
}
</script>

<template>
  <div class="consult-report-view">
    <AppHeader title="상담 리포트" @back="goToMyConsultations" />

    <template v-if="reservation && counselor">
      <div class="consult-report-view__summary">
        <div class="consult-report-view__avatar">
          <img
            v-if="counselor.image"
            class="consult-report-view__avatar-img"
            :src="counselor.image"
            alt=""
          />
          <span v-else class="consult-report-view__avatar-fallback">{{
            counselor.name.charAt(0)
          }}</span>
        </div>
        <div class="consult-report-view__summary-info">
          <p class="consult-report-view__summary-name">{{ counselor.name }} 상담사</p>
          <p class="consult-report-view__summary-meta">{{ scheduleLabel }} · {{ subjectLabel }}</p>
        </div>
      </div>

      <!-- 상담 기준 정보는 AI가 만드는 값이 아니라 예약 시점부터 이미 알고 있던 값이라,
           리포트 생성 상태(GENERATING/FAILED)와 무관하게 항상 보여준다. -->
      <section class="consult-report-view__section">
        <h2 class="consult-report-view__section-title">상담 기준 정보</h2>
        <ConsultationInfoCard
          :consultation-type="reservation.consultationType"
          :consultation-data="consultInfo"
        />
      </section>

      <div v-if="reportStatus === 'GENERATING'" class="consult-report-view__generating">
        <BaseClimbingLoader />
        <div class="consult-report-view__generating-text">
          <p class="consult-report-view__generating-title">상담 내용을 정리하고 있습니다.</p>
          <p class="consult-report-view__generating-desc">잠시만 기다려주세요.</p>
        </div>
      </div>

      <div v-else-if="reportStatus === 'FAILED'" class="consult-report-view__failed">
        <p class="consult-report-view__failed-title">상담 리포트를 생성하지 못했습니다.</p>
        <p class="consult-report-view__failed-desc">잠시 후 다시 시도해주세요.</p>
        <BaseButton size="lg" @click="handleRetryGenerate">다시 생성</BaseButton>
      </div>

      <template v-else>
        <section class="consult-report-view__section">
          <h2 class="consult-report-view__section-title">상담 요약</h2>
          <BaseCard>
            <p class="consult-report-view__summary-text">{{ report.summary }}</p>
          </BaseCard>
        </section>

        <section class="consult-report-view__section">
          <h2 class="consult-report-view__section-title">핵심 고민과 상담 내용</h2>
          <BaseCard class="consult-report-view__discussion-card">
            <div class="consult-report-view__subsection">
              <h3 class="consult-report-view__subtitle">핵심 고민</h3>
              <ul class="consult-report-view__list">
                <li v-for="item in report.mainConcerns" :key="item">{{ item }}</li>
              </ul>
            </div>
            <div class="consult-report-view__subsection">
              <h3 class="consult-report-view__subtitle">함께 확인한 내용</h3>
              <ul class="consult-report-view__list">
                <li v-for="item in report.discussionPoints" :key="item">{{ item }}</li>
              </ul>
            </div>
          </BaseCard>
        </section>

        <section class="consult-report-view__section">
          <h2 class="consult-report-view__section-title">상담 결과 및 제안</h2>
          <BaseCard class="consult-report-view__discussion-card">
            <div class="consult-report-view__subsection">
              <h3 class="consult-report-view__subtitle">상담 결과</h3>
              <p class="consult-report-view__result-text">{{ report.result }}</p>
            </div>
            <div class="consult-report-view__subsection">
              <h3 class="consult-report-view__subtitle">상담에서 제안된 내용</h3>
              <ul class="consult-report-view__list">
                <li v-for="item in report.recommendations" :key="item">{{ item }}</li>
              </ul>
            </div>
          </BaseCard>
        </section>

        <section v-if="nextSteps.length" class="consult-report-view__section">
          <h2 class="consult-report-view__section-title">바로가기</h2>
          <div class="consult-report-view__actions">
            <BaseCard
              v-for="step in nextSteps"
              :key="step.title"
              class="consult-report-view__action-card"
            >
              <p class="consult-report-view__action-title">{{ step.title }}</p>
              <p class="consult-report-view__action-desc">{{ step.description }}</p>
              <BaseButton
                class="consult-report-view__action-button"
                variant="highlight"
                @click="step.handler()"
              >
                <span>{{ step.label }}</span>
                <BaseChevronIcon :size="12" />
              </BaseButton>
            </BaseCard>
          </div>
        </section>
      </template>
    </template>

    <p v-else-if="!isLoadingReservation" class="consult-report-view__notice-empty">
      상담 정보를 찾을 수 없어요.
    </p>
  </div>
</template>

<style scoped>
.consult-report-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── 상담 기본 정보 ────────────────────────────────────────── */

.consult-report-view__summary {
  display: flex;
  align-items: center;
  gap: 12px;
}

.consult-report-view__avatar {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  overflow: hidden;
  border-radius: 24px;
  background: var(--color-surface-soft, #cdedd3);
}

.consult-report-view__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.consult-report-view__avatar-fallback {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-primary, #1d6b3f);
}

.consult-report-view__summary-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.consult-report-view__summary-name {
  margin: 0;
  font-size: 15.5px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.consult-report-view__summary-meta {
  margin: 0;
  font-size: 12.5px;
  color: var(--color-text-secondary, #9aa09a);
}

/* ── 섹션 공통 ─────────────────────────────────────────────── */

.consult-report-view__section {
  display: flex;
  flex-direction: column;
}

.consult-report-view__section-title {
  margin: 0 0 8px;
  padding: 0 4px;
  font-size: 14.5px;
  font-weight: 600;
  color: var(--color-text-secondary, #9aa09a);
}

.consult-report-view__summary-text {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--color-text-primary, #ffffff);
}

/* ── 핵심 고민 / 상담 결과 카드 내부 소제목 ────────────────────── */

.consult-report-view__discussion-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.consult-report-view__subsection + .consult-report-view__subsection {
  padding-top: 16px;
  border-top: 1px solid var(--color-border, #262626);
}

.consult-report-view__subtitle {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.consult-report-view__list {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-text-secondary, #9aa09a);
}

.consult-report-view__result-text {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--color-text-primary, #ffffff);
}

/* ── 다음 할 일 ────────────────────────────────────────────── */

.consult-report-view__actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.consult-report-view__action-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.consult-report-view__action-title {
  margin: 0;
  font-size: 14.5px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.consult-report-view__action-desc {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--color-text-secondary, #9aa09a);
}

/* 텍스트만 오른쪽에 두던 기존 방식 대신, 연한 primary 배경의 실제 버튼으로 바꾼다.
   색만 SavingForecastCard의 인카드 CTA(연한 primary 배경 + hover)와 맞추고,
   나머지(전체 폭/높이/radius/폰트 크기)는 variant="highlight"(size 기본값 lg)를
   그대로 쓴다 - 새 버튼 스타일을 만들지 않는다. */
.consult-report-view__action-button {
  justify-content: space-between;
  margin-top: 10px;
  height: 46px;
  background: var(--color-primary-soft, #e8f4ea);
  color: var(--color-primary, #1d6b3f);
  transition: background-color 0.15s ease;
}

@media (hover: hover) and (pointer: fine) {
  .consult-report-view__action-button:hover {
    background: var(--color-primary-soft-hover, #c2dec7);
  }
}

/* ── 생성 중 / 생성 실패 ───────────────────────────────────── */

.consult-report-view__generating {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
  min-height: 50vh;
  padding: 40px 0;
  text-align: center;
}

.consult-report-view__generating-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.consult-report-view__generating-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.consult-report-view__generating-desc {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-secondary, #9aa09a);
}

.consult-report-view__failed {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 64px 16px;
  text-align: center;
}

.consult-report-view__failed-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.consult-report-view__failed-desc {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--color-text-secondary, #9aa09a);
}

/* ── 빈 상태 ───────────────────────────────────────────────── */

.consult-report-view__notice-empty {
  padding: 48px 0;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-secondary, #9aa09a);
}
</style>
