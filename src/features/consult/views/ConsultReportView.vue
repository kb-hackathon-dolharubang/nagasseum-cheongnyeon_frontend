<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppHeader from '@/shared/components/molecules/AppHeader.vue'
import BaseCard from '@/shared/components/atoms/base/card/BaseCard.vue'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'
import BaseClimbingLoader from '@/shared/components/atoms/feedback/ClimbingLoader/BaseClimbingLoader.vue'
import BaseChevronIcon from '@/shared/components/atoms/base/icon/BaseChevronIcon.vue'
import ConsultationInfoCard from '@/features/consult/components/ConsultationInfoCard.vue'
import {
  counselors,
  myConsultations,
  consultationReports,
} from '@/features/consult/data/counselors'
import { getCategorySubjectLabel } from '@/features/consult/constants/categories'
import { buildConsultInfo } from '@/features/consult/utils/consultInfo'
import { formatMonthDayWeekdayKo } from '@/shared/utils/formatter'
import { fetchActiveGoal } from '@/features/goal/api/goalApi'

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

// "상담 기준 정보"는 AI가 새로 추론하는 값이 아니라, 상담 예약 2단계와 똑같은 방식으로
// 기존 두 원본 Mock(recentDiagnosisGoal/generalConsultInfo)에서 그대로 가져온다.
const consultInfo = computed(() =>
  reservation.value ? buildConsultInfo(reservation.value.consultationType) : null,
)

const subjectLabel = computed(() => getCategorySubjectLabel(reservation.value?.category))
const scheduleLabel = computed(() =>
  reservation.value ? formatMonthDayWeekdayKo(reservation.value.reservationDate) : '',
)

// AI가 만드는 리포트 결과. reservationId에 해당하는 Mock이 아직 없으면(막 종료한
// 상담처럼 실제로도 AI가 아직 결과를 안 만들었을 상태) 생성 중으로 본다.
const report = computed(() => consultationReports[Number(props.reservationId)] ?? null)
const reportStatus = ref(report.value?.status ?? 'GENERATING')

function handleRetryGenerate() {
  // 실제 재생성 API는 아직 없어 상태 전환 지점만 만들어둔다.
  reportStatus.value = 'GENERATING'
}

// nextActions.actionType별로 이동할 기존 서비스 화면. 저축 전용 화면이 따로 없고
// 월 저축 조정도 목표 상세 화면 안에서 이뤄지므로 SAVING/GOAL 모두 그리로 보낸다.
async function goToGoal() {
  try {
    const activeGoal = await fetchActiveGoal()
    if (activeGoal) {
      router.push({ name: 'goal-detail', params: { goalId: activeGoal.goalId } })
    } else {
      router.push({ name: 'goal-empty' })
    }
  } catch {
    router.push({ name: 'goal-empty' })
  }
}

// 실제로 이동할 화면이 있는 actionType만 등록한다. LOAN처럼 연결할 화면이 아직
// 없는 타입은 여기 없으면 CTA 자체를 만들지 않는다 - "준비 중" 같은 대체 문구도
// 쓰지 않고, 제목/설명만 있는 카드로 자연스럽게 끝낸다.
const ACTION_CTA = {
  SAVING: { label: '저축 계획 확인하기', handler: goToGoal },
  GOAL: { label: '목표 수정하기', handler: goToGoal },
}

// report는 GENERATING/FAILED일 때 null일 수 있어 옵셔널 체이닝으로 안전하게 처리한다.
const nextActions = computed(() =>
  (report.value?.nextActions ?? []).map((action) => ({
    ...action,
    cta: ACTION_CTA[action.actionType] ?? null,
  })),
)

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

        <section class="consult-report-view__section">
          <h2 class="consult-report-view__section-title">다음 할 일</h2>
          <div class="consult-report-view__actions">
            <BaseCard
              v-for="action in nextActions"
              :key="action.title"
              class="consult-report-view__action-card"
            >
              <p class="consult-report-view__action-title">{{ action.title }}</p>
              <p class="consult-report-view__action-desc">{{ action.description }}</p>
              <BaseButton
                v-if="action.cta"
                class="consult-report-view__action-button"
                variant="highlight"
                @click="action.cta.handler()"
              >
                <span>{{ action.cta.label }}</span>
                <BaseChevronIcon :size="12" />
              </BaseButton>
            </BaseCard>
          </div>
        </section>
      </template>
    </template>

    <p v-else class="consult-report-view__notice-empty">상담 정보를 찾을 수 없어요.</p>
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
