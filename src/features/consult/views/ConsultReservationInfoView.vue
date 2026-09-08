<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppHeader from '@/shared/components/molecules/AppHeader.vue'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'
import BaseBadge from '@/shared/components/atoms/base/badge/BaseBadge.vue'
import BaseChipGroup from '@/shared/components/atoms/form/ChipGroup/BaseChipGroup.vue'
import ReservationStepIndicator from '@/features/consult/components/ReservationStepIndicator.vue'
import ConsultationInfoCard from '@/features/consult/components/ConsultationInfoCard.vue'
import ConsultationInfoSheet from '@/features/consult/components/ConsultationInfoSheet.vue'
import { counselors } from '@/features/consult/data/counselors'
import { CATEGORY_OPTIONS, CATEGORY_LABELS } from '@/features/consult/constants/categories'
import { buildConsultInfo } from '@/features/consult/utils/consultInfo'

const props = defineProps({
  counselorId: { type: String, required: true },
})

const router = useRouter()

const counselor = computed(
  () => counselors.find((item) => item.id === Number(props.counselorId)) ?? null,
)

// 날짜·시간 선택 화면이 router state로 넘겨준 값을 그대로 읽는다(URL에는 남기지 않는다).
// 새 전역 store 없이, 이전 화면들과 같은 방식으로만 이어받는다.
const reservationState = window.history.state ?? {}
const selectedDate = reservationState.date ?? null
const selectedTime = reservationState.time ?? null
const consultationType =
  reservationState.consultationType === 'GOAL_DIAGNOSIS' ? 'GOAL_DIAGNOSIS' : 'GENERAL'

const MAX_MESSAGE_LENGTH = 500
const requestMessage = ref('')

// "2026-09-09" + "14:00" -> "9월 9일 · 14:00"
const scheduleLabel = computed(() => {
  if (!selectedDate) return ''
  const date = new Date(selectedDate)
  return `${date.getMonth() + 1}월 ${date.getDate()}일 · ${selectedTime ?? ''}`
})

/* ── 상담 분야 ─────────────────────────────────────────────────
   consultationType(어떤 방식으로 들어왔는지)과 category(실제 상담하고 싶은 분야)는
   서로 다른 값이라 따로 관리한다 - GOAL_DIAGNOSIS로 들어와도 분야는 바꿀 수 있다. */

const selectedCategory = ref(reservationState.category ?? null)

// 상담 홈에서 분야가 정해지지 않은 채 들어왔다면 처음부터 후보를 펼쳐서 보여준다.
// 후보 중 하나를 누르면 그 자리에서 바로 확정되고 목록이 접힌다(별도 '완료' 없음).
const isCategoryEditing = ref(!selectedCategory.value)

const categorySectionTitle = computed(() =>
  selectedCategory.value ? '상담 분야' : '상담 분야를 선택해주세요',
)

const subjectLabel = computed(() => {
  const label = CATEGORY_LABELS[selectedCategory.value]
  return label ? `${label} 상담` : null
})

function selectCategory(value) {
  selectedCategory.value = value
  isCategoryEditing.value = false
}

function toggleCategoryEdit() {
  isCategoryEditing.value = !isCategoryEditing.value
}

/* ── 상담에 활용되는 정보 ───────────────────────────────────────
   원본 서비스 데이터(recentDiagnosisGoal/generalConsultInfo Mock)는 절대 바꾸지 않는다.
   이 화면(그리고 상담 정보 Bottom Sheet)이 다루는 값은 그 원본을 복사해 만든 별도의
   "상담용" 상태(consultationData)뿐이다 - Bottom Sheet에서 무엇을 고치든 서비스에
   저장된 원본 자산/목표 데이터는 그대로 남는다. 초기값을 만드는 로직은 상담 리포트
   화면과 공유하기 위해 buildConsultInfo로 뽑아뒀다. */

const consultationData = reactive(buildConsultInfo(consultationType))
const isInfoSheetOpen = ref(false)

const isInfoComplete = computed(
  () =>
    Boolean(consultationData.housingPreference) &&
    consultationData.currentAsset != null &&
    consultationData.monthlySaving != null &&
    Boolean(consultationData.targetDate),
)

const infoCardTitle = computed(() =>
  consultationType === 'GOAL_DIAGNOSIS' ? '상담에 활용되는 목표' : '상담에 활용되는 정보',
)
const infoSheetTriggerLabel = computed(() => (isInfoComplete.value ? '수정' : '정보 입력'))

function handleInfoSave(updated) {
  Object.assign(consultationData, updated)
}

/* ── 예약 확정 ─────────────────────────────────────────────────── */

const canConfirm = computed(() => Boolean(selectedCategory.value) && isInfoComplete.value)

function handleConfirm() {
  if (!canConfirm.value) return

  const payload = {
    // 실제 예약 API가 생기면 POST 응답의 reservationId로 바뀐다. 지금은 확정 화면을
    // 만들기 위한 임시 Mock 값이다.
    reservationId: 1,
    counselorId: Number(props.counselorId),
    consultationType,
    category: selectedCategory.value,
    reservationDate: selectedDate,
    reservationTime: selectedTime,
    requestMessage: requestMessage.value.trim(),
  }

  // 승인 절차 없이 바로 확정되는 정책이라, 이 화면으로 되돌아올 이유가 없어 push가 아닌
  // replace로 이동한다(제출 화면과 입력 화면이 히스토리에 번갈아 쌓이지 않게 한다).
  router.replace({ name: 'consult-reservation-complete', state: payload })
}
</script>

<template>
  <div class="consult-reservation-info-view">
    <AppHeader title="상담 예약" @back="router.back()" />

    <template v-if="counselor">
      <div class="consult-reservation-info-view__summary">
        <div class="consult-reservation-info-view__avatar">
          <img
            v-if="counselor.image"
            class="consult-reservation-info-view__avatar-img"
            :src="counselor.image"
            alt=""
          />
          <span v-else class="consult-reservation-info-view__avatar-fallback">{{
            counselor.name.charAt(0)
          }}</span>
        </div>
        <div class="consult-reservation-info-view__summary-info">
          <p class="consult-reservation-info-view__summary-name">{{ counselor.name }} 상담사</p>
          <p class="consult-reservation-info-view__summary-schedule">{{ scheduleLabel }}</p>
        </div>
        <BaseButton
          class="consult-reservation-info-view__change"
          variant="text"
          @click="router.back()"
        >
          일정 변경
        </BaseButton>
      </div>

      <ReservationStepIndicator :current="2" />

      <section class="consult-reservation-info-view__section">
        <div class="consult-reservation-info-view__section-head">
          <h2 class="consult-reservation-info-view__section-title">{{ categorySectionTitle }}</h2>
          <BaseButton v-if="selectedCategory" variant="text" @click="toggleCategoryEdit">
            {{ isCategoryEditing ? '취소' : '변경' }}
          </BaseButton>
        </div>

        <BaseChipGroup
          v-if="isCategoryEditing"
          :model-value="selectedCategory"
          :options="CATEGORY_OPTIONS"
          size="sm"
          @update:model-value="selectCategory"
        />
        <BaseBadge v-else variant="mint" class="consult-reservation-info-view__subject">
          {{ subjectLabel }}
        </BaseBadge>
      </section>

      <section class="consult-reservation-info-view__section">
        <div class="consult-reservation-info-view__section-head">
          <div class="consult-reservation-info-view__section-head-left">
            <h2 class="consult-reservation-info-view__section-title">{{ infoCardTitle }}</h2>
            <BaseBadge variant="outline">필수</BaseBadge>
          </div>
          <BaseButton variant="text" @click="isInfoSheetOpen = true">
            {{ infoSheetTriggerLabel }}
          </BaseButton>
        </div>

        <ConsultationInfoCard
          :consultation-type="consultationType"
          :consultation-data="consultationData"
          @open-sheet="isInfoSheetOpen = true"
        />

        <p class="consult-reservation-info-view__notice">위 정보가 상담사에게 공유됩니다.</p>
      </section>

      <section class="consult-reservation-info-view__section">
        <h2 class="consult-reservation-info-view__section-title">
          상담하고 싶은 내용을 적어주세요
        </h2>
        <textarea
          v-model="requestMessage"
          class="consult-reservation-info-view__textarea"
          :maxlength="MAX_MESSAGE_LENGTH"
          rows="5"
          placeholder="상담에서 궁금한 점이나 미리 전달하고 싶은 내용을 입력해주세요."
        />
        <p class="consult-reservation-info-view__counter">
          {{ requestMessage.length }} / {{ MAX_MESSAGE_LENGTH }}
        </p>
      </section>
    </template>

    <p v-else class="consult-reservation-info-view__notice-empty">상담사 정보를 찾을 수 없어요.</p>

    <div class="consult-reservation-info-view__footer">
      <BaseButton size="lg" :disabled="!canConfirm" @click="handleConfirm">
        예약 확정하기
      </BaseButton>
      <p class="consult-reservation-info-view__confirm-notice">
        상담사 승인 없이 예약이 바로 확정됩니다.
      </p>
    </div>

    <ConsultationInfoSheet
      v-model="isInfoSheetOpen"
      :initial-data="consultationData"
      @save="handleInfoSave"
    />
  </div>
</template>

<style scoped>
.consult-reservation-info-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── 선택한 일정 요약 ──────────────────────────────────────── */
/* 예약 2단계는 이미 상담사를 고른 뒤라 프로필이 화면의 주인공일 필요가 없어,
   1단계보다 작은 아바타(52px→40px)로 컴팩트하게 정리한다. */

.consult-reservation-info-view__summary {
  display: flex;
  align-items: center;
  gap: 10px;
}

.consult-reservation-info-view__avatar {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  overflow: hidden;
  border-radius: 20px;
  background: var(--color-surface-soft, #cdedd3);
}

.consult-reservation-info-view__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.consult-reservation-info-view__avatar-fallback {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-primary, #1d6b3f);
}

.consult-reservation-info-view__summary-info {
  flex: 1;
  min-width: 0;
}

.consult-reservation-info-view__summary-name {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.consult-reservation-info-view__summary-schedule {
  margin: 2px 0 0;
  font-size: 12.5px;
  color: var(--color-text-secondary, #9aa09a);
}

.consult-reservation-info-view__change {
  flex: none;
}

/* ── 섹션 공통 ─────────────────────────────────────────────── */

.consult-reservation-info-view__section {
  display: flex;
  flex-direction: column;
}

.consult-reservation-info-view__section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.consult-reservation-info-view__section-head-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.consult-reservation-info-view__section-title {
  margin: 0;
  padding: 0 4px;
  font-size: 14.5px;
  font-weight: 600;
  color: var(--color-text-primary, #ffffff);
}

.consult-reservation-info-view__subject {
  align-self: flex-start;
  margin-left: 4px;
  font-weight: 700;
}

/* ── 안내 문구 ─────────────────────────────────────────────── */

.consult-reservation-info-view__notice {
  margin: 8px 4px 0;
  font-size: 12px;
  color: var(--color-text-tertiary, #6f766d);
}

.consult-reservation-info-view__notice-empty {
  padding: 48px 0;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-secondary, #9aa09a);
}

/* ── 상담 요청 내용 ────────────────────────────────────────── */

.consult-reservation-info-view__textarea {
  box-sizing: border-box;
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--color-border, #262626);
  border-radius: 15px;
  background: var(--color-surface, #161616);
  color: var(--color-text-primary, #ffffff);
  font: inherit;
  font-size: 13.5px;
  line-height: 1.5;
  resize: none;
}

.consult-reservation-info-view__textarea::placeholder {
  color: var(--color-text-tertiary, #6f766d);
}

.consult-reservation-info-view__counter {
  margin: 6px 4px 0;
  text-align: right;
  font-size: 11.5px;
  color: var(--color-text-tertiary, #6f766d);
}

/* ── 푸터 ──────────────────────────────────────────────────── */

.consult-reservation-info-view__footer {
  position: sticky;
  bottom: 0;
  z-index: 4;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 0 8px;
  background: var(--color-app-bg, #111111);
}

.consult-reservation-info-view__confirm-notice {
  margin: 0;
  font-size: 11.5px;
  color: var(--color-text-tertiary, #6f766d);
}
</style>
