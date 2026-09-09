<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppHeader from '@/shared/components/molecules/AppHeader.vue'
import BaseCard from '@/shared/components/atoms/base/card/BaseCard.vue'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'
import BaseClimbingLoader from '@/shared/components/atoms/feedback/BaseClimbingLoader.vue'
import BaseChevronIcon from '@/shared/components/atoms/base/icon/BaseChevronIcon.vue'
import { counselors } from '@/features/consult/data/counselors'
import {
  CATEGORY_FROM_API_VALUES,
  getCategorySubjectLabel,
} from '@/features/consult/constants/categories'
import { buildConsultInfo, buildConsultationInfoRows } from '@/features/consult/utils/consultInfo'
import { formatMonthDayWeekdayKo } from '@/shared/utils/formatter'
import { fetchActiveGoal } from '@/features/goal/api/goalApi'
import { useAuthStore } from '@/features/auth'
import {
  getUserConsultations,
  getConsultationReport,
  retryConsultationReport,
} from '@/features/consult/api/consultApi'

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

// "01 상담 기준 정보"를 리포트답게 압축된 형태로 보여준다 - 희망 주거 조건처럼 긴 문장형
// 값(라벨에 "조건"이 들어간 행)은 위에 한 줄로, 자산/저축액/시점처럼 짧은 값은 2열
// 그리드로 나눠 배치한다. GOAL_DIAGNOSIS(추천 조건/추천 월 저축액 포함 6행)도 같은
// 방식으로 자연히 나뉜다. 값이 없는 행은(정상 흐름에선 항상 채워져 있지만) 억지로 빈
// 줄을 만들지 않도록 걸러낸다.
const consultInfoRows = computed(() => {
  if (!reservation.value || !consultInfo.value) return []
  return buildConsultationInfoRows(reservation.value.consultationType, consultInfo.value).filter(
    (row) => row.value,
  )
})
const consultInfoWideRows = computed(() =>
  consultInfoRows.value.filter((row) => row.label.includes('조건')),
)
const consultInfoGridRows = computed(() =>
  consultInfoRows.value.filter((row) => !row.label.includes('조건')),
)

/* ── 리포트 조회 ───────────────────────────────────────────────
   상담 종료 시점에 백엔드가 이미 생성해 저장해둔 리포트를 읽어오기만 한다. */

const report = ref(null)
const reportStatus = ref('GENERATING')

// "02 상담 요약"이 긴 문장이 한 덩어리로 보이지 않도록 마침표 단위로 나눠 문단
// 간격을 준다 - summary 문자열 자체는 그대로 두고 화면에 나눠 그리기만 한다.
const summaryParagraphs = computed(() => {
  const text = report.value?.summary ?? ''
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
})

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

// FAILED일 때만 호출된다(NO_MESSAGES는 버튼 자체가 없음). 재시도도 동기 호출이라
// 몇십 초 걸릴 수 있어 GENERATING 화면을 그대로 재사용한다.
async function handleRetryGenerate() {
  reportStatus.value = 'GENERATING'
  try {
    const result = await retryConsultationReport(props.reservationId)
    report.value = result
    reportStatus.value = result?.status ?? 'FAILED'
  } catch {
    report.value = null
    reportStatus.value = 'FAILED'
  }
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
            :class="{ 'consult-report-view__avatar-img--crop': counselor.crop }"
            :src="counselor.image"
            :style="counselor.crop"
            alt=""
          />
          <span v-else class="consult-report-view__avatar-fallback">{{
            counselor.name.charAt(0)
          }}</span>
        </div>
        <div class="consult-report-view__summary-info">
          <p class="consult-report-view__summary-name">
            {{ counselor.name }}{{ counselor.isMentor ? '' : ' 상담사' }}
          </p>
          <p class="consult-report-view__summary-meta">{{ scheduleLabel }} · {{ subjectLabel }}</p>
        </div>
      </div>

      <!-- 리포트 전체를 빠르게 파악할 수 있는 결론 - 새로 만들어내는 문장이 아니라
           report.result를 그대로 보여준다(요약값이 생겼을 때만 의미가 있어 COMPLETED일
           때만 노출). -->
      <section v-if="reportStatus === 'COMPLETED'" class="consult-report-view__conclusion">
        <p class="consult-report-view__conclusion-label">이번 상담의 결론</p>
        <p class="consult-report-view__conclusion-text">{{ report.result }}</p>
      </section>

      <!-- 상담 기준 정보는 AI가 만드는 값이 아니라 예약 시점부터 이미 알고 있던 값이라,
           리포트 생성 상태(GENERATING/FAILED)와 무관하게 항상 보여준다. -->
      <section class="consult-report-view__section">
        <h2 class="consult-report-view__section-title">01 상담 기준 정보</h2>
        <BaseCard class="consult-report-view__info-card">
          <div
            v-for="row in consultInfoWideRows"
            :key="row.label"
            class="consult-report-view__info-wide"
          >
            <span class="consult-report-view__info-label">{{ row.label }}</span>
            <p class="consult-report-view__info-value">{{ row.value }}</p>
          </div>
          <div class="consult-report-view__info-grid">
            <div
              v-for="row in consultInfoGridRows"
              :key="row.label"
              class="consult-report-view__info-cell"
            >
              <span class="consult-report-view__info-label">{{ row.label }}</span>
              <p class="consult-report-view__info-value">{{ row.value }}</p>
            </div>
          </div>
        </BaseCard>
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

      <!-- 상담 중 나눈 메시지가 없어 애초에 요약할 내용이 없는 경우. 다시 시도해도
           똑같은 결과라 FAILED와 달리 재시도 버튼을 두지 않는다. -->
      <div v-else-if="reportStatus === 'NO_MESSAGES'" class="consult-report-view__failed">
        <p class="consult-report-view__failed-title">리포트를 생성할 상담 내용이 없어요.</p>
        <p class="consult-report-view__failed-desc">
          상담 중 나눈 대화가 없어 요약할 내용이 없습니다.
        </p>
      </div>

      <template v-else>
        <section class="consult-report-view__section">
          <h2 class="consult-report-view__section-title">02 상담 요약</h2>
          <div class="consult-report-view__summary-body">
            <p
              v-for="(sentence, index) in summaryParagraphs"
              :key="index"
              class="consult-report-view__summary-text"
            >
              {{ sentence }}
            </p>
          </div>
        </section>

        <section
          v-if="report.mainConcerns?.length || report.discussionPoints?.length"
          class="consult-report-view__section"
        >
          <h2 class="consult-report-view__section-title">03 상담 내용</h2>
          <BaseCard class="consult-report-view__discussion-card">
            <div v-if="report.mainConcerns?.length" class="consult-report-view__subsection">
              <h3 class="consult-report-view__subtitle">핵심 고민</h3>
              <ul class="consult-report-view__list">
                <li
                  v-for="(item, index) in report.mainConcerns"
                  :key="item"
                  class="consult-report-view__list-item"
                >
                  <span class="consult-report-view__list-marker">{{ index + 1 }}</span>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>
            <div v-if="report.discussionPoints?.length" class="consult-report-view__subsection">
              <h3 class="consult-report-view__subtitle">함께 확인한 내용</h3>
              <ul class="consult-report-view__list">
                <li
                  v-for="(item, index) in report.discussionPoints"
                  :key="item"
                  class="consult-report-view__list-item"
                >
                  <span class="consult-report-view__list-marker">{{ index + 1 }}</span>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>
          </BaseCard>
        </section>

        <section v-if="report.recommendations?.length" class="consult-report-view__section">
          <h2 class="consult-report-view__section-title">04 상담 제안</h2>
          <ul class="consult-report-view__list">
            <li
              v-for="item in report.recommendations"
              :key="item"
              class="consult-report-view__list-item"
            >
              <span class="consult-report-view__list-marker consult-report-view__list-marker--check"
                >✓</span
              >
              <span>{{ item }}</span>
            </li>
          </ul>
        </section>

        <section
          v-if="nextSteps.length"
          class="consult-report-view__section consult-report-view__section--next-steps"
        >
          <h2 class="consult-report-view__section-title">다음 단계</h2>
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
  position: relative;
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

.consult-report-view__avatar-img--crop {
  position: absolute;
  height: auto;
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

/* ── 이번 상담의 결론 ──────────────────────────────────────────
   리포트를 빠르게 파악할 수 있도록 다른 section보다 먼저, 살짝 강조해서 보여준다.
   새 색을 추가하지 않고 다른 카드 CTA(action-button)에도 쓰는 옅은 primary 배경 +
   진한 primary 텍스트 조합을 그대로 쓰고, 왼쪽 accent border만 더한다. */

.consult-report-view__conclusion {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  border-radius: 12px;
  border-left: 3px solid var(--color-primary, #1d6b3f);
  background: var(--color-primary-soft, #e3ffe8);
}

.consult-report-view__conclusion-label {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-primary, #1d6b3f);
}

.consult-report-view__conclusion-text {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.6;
  color: var(--color-primary, #1d6b3f);
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

.consult-report-view__summary-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  /* section-title의 margin-bottom(8px)에 더해, 본문 시작 지점을 조금 더 떼어
     제목/본문 경계를 분명히 한다. */
  margin-top: 4px;
}

.consult-report-view__summary-text {
  margin: 0;
  padding: 0 4px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--color-text-primary, #ffffff);
}

/* ── 01 상담 기준 정보: 압축 그리드 ─────────────────────────────
   희망 주거 조건처럼 긴 문장형 값은 위에 한 줄로, 자산/저축액/시점처럼 짧은 값은
   2열 그리드로 묶어서 세로 공간과 divider 반복을 줄인다. */

.consult-report-view__info-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.consult-report-view__info-wide {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.consult-report-view__info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
}

.consult-report-view__info-wide + .consult-report-view__info-grid {
  padding-top: 12px;
  border-top: 1px solid var(--color-border, #262626);
}

.consult-report-view__info-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.consult-report-view__info-label {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--color-text-secondary, #9aa09a);
}

.consult-report-view__info-value {
  margin: 0;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
  overflow-wrap: break-word;
}

/* ── 핵심 고민 / 함께 확인한 내용 카드 내부 소제목 ─────────────── */

.consult-report-view__discussion-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* BaseCard 기본(lg) 상하 padding(20px)이 목록 카드엔 다소 길어 보여, 이 카드만
   상하 padding을 줄인다 - 좌우는 그대로 둬서 다른 카드와 정렬을 맞춘다. */
.consult-report-view__discussion-card.base-card--lg {
  padding-top: 14px;
  padding-bottom: 14px;
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

/* mainConcerns/discussionPoints/recommendations 공통 리스트. 번호 없이 촘촘한
   불릿 목록 대신, 항목마다 작은 마커 + 여백으로 서로 구분되어 읽히게 한다. */
.consult-report-view__list {
  margin: 0;
  padding: 0 4px;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.consult-report-view__list-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-text-secondary, #9aa09a);
}

.consult-report-view__list-marker {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  /* list-item이 align-items: flex-start라 마커 박스 윗변 자체는 옆 글자와 이미
     맞아 있지만, 마커 안 숫자는 18px 원 안에서 가운데 정렬돼 있고 옆 글자는 13px/1.5
     줄 안에서 살짝 아래로 치우쳐 보여 시각적으로 어긋나 보인다. 그 차이만큼 살짝
     내려서 숫자와 글자 첫 줄이 같은 높이에서 시작하는 것처럼 보이게 맞춘다. */
  margin-top: 2px;
  border-radius: 9px;
  background: var(--color-primary-soft, #e3ffe8);
  color: var(--color-primary, #1d6b3f);
  font-size: 10.5px;
  font-weight: 700;
  line-height: 1;
}

.consult-report-view__list-marker--check {
  font-size: 11px;
}

/* 04 상담 제안 목록과 다음 단계 CTA는 성격이 달라(참고 정보 vs 실행 버튼), 기본
   section 간격(20px)보다 조금 더 떼어 구분을 분명히 한다. */
.consult-report-view__section--next-steps {
  margin-top: 12px;
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
