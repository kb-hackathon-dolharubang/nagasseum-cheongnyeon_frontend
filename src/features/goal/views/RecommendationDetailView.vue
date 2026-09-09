<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import AppHeader from '@/shared/components/molecules/AppHeader.vue'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'
import BaseSkeleton from '@/shared/components/atoms/feedback/BaseSkeleton.vue'
import BaseEmptyState from '@/shared/components/atoms/feedback/BaseEmptyState.vue'

import RecommendationHousingCard from '@/features/goal/components/RecommendationHousingCard.vue'
import RecommendationCompareCard from '@/features/goal/components/RecommendationCompareCard.vue'
import RecommendationLoanTabs from '@/features/goal/components/RecommendationLoanTabs.vue'
import RecommendationLoanCard from '@/features/goal/components/RecommendationLoanCard.vue'
import GoalConfirmModal from '@/features/goal/components/GoalConfirmModal.vue'
import { useGoalStore } from '@/features/goal/store/goalStore'
import {
  RECOMMENDATION_TITLE_MAP,
  toRecommendationDescription,
  toCompareCardViewModel,
  toLoanCardsViewModel,
  toOrderedRecommendationList,
  toGoalCreationPayload,
} from '@/features/goal/utils/recommendationViewModel'

const SWIPE_THRESHOLD_PX = 40
const DRAG_START_THRESHOLD_PX = 4
const TRACK_GAP_PX = 8

const router = useRouter()
const goalStore = useGoalStore()
const isConfirmOpen = ref(false)

const orderedList = computed(() => toOrderedRecommendationList(goalStore.recommendations))
const hasAnyRecommendation = computed(() => orderedList.value.length > 0)

const currentIndex = ref(0)
const safeIndex = computed(() =>
  Math.min(currentIndex.value, Math.max(orderedList.value.length - 1, 0)),
)
const total = computed(() => orderedList.value.length)

const slides = computed(() =>
  orderedList.value.map((rec) => ({
    type: rec.type,
    recommendation: rec,
    title: RECOMMENDATION_TITLE_MAP[rec.type] ?? rec.title,
    description: toRecommendationDescription(rec),
    compareView: toCompareCardViewModel(rec, goalStore.recommendations),
    loanCards: toLoanCardsViewModel(rec),
  })),
)
const currentSlide = computed(() => slides.value[safeIndex.value] ?? null)
const recommendation = computed(() => currentSlide.value?.recommendation ?? null)

const loopSlides = computed(() => {
  const list = slides.value
  if (list.length <= 1) return list
  return [
    { ...list[list.length - 1], key: `${list[list.length - 1].type}__loop-start` },
    ...list,
    { ...list[0], key: `${list[0].type}__loop-end` },
  ]
})

const slideElements = new Map()
function setSlideRef(el, type) {
  if (el) slideElements.set(type, el)
  else slideElements.delete(type)
}

const trackHeight = ref(null)
function syncTrackHeight() {
  const el = currentSlide.value && slideElements.get(currentSlide.value.type)
  if (el) trackHeight.value = el.offsetHeight
}

watch(safeIndex, syncTrackHeight)
watch(slides, async () => {
  await nextTick()
  syncTrackHeight()
})

const selectedLoanIndexByType = reactive({})
function selectedLoanIndexFor(type) {
  return selectedLoanIndexByType[type] ?? 0
}
const selectedLoan = computed(() => {
  if (!currentSlide.value) return null
  return currentSlide.value.loanCards[selectedLoanIndexFor(currentSlide.value.type)] ?? null
})

onMounted(async () => {
  await goalStore.loadRecommendationResult()
})

function handleSetAsGoal() {
  isConfirmOpen.value = true
}

async function confirmAndSaveGoal(plan) {
  const saved = await goalStore.saveGoal(toGoalCreationPayload(recommendation.value, plan))
  if (!saved) return
  isConfirmOpen.value = false
  router.push({ name: 'home' })
}

function goToDiagnosis() {
  router.replace({ name: 'diagnosis', state: { fromDiagnosisResult: true } })
}

let pointerStartX = 0
let pointerStartY = 0
let isPointerDown = false
let suppressNextClick = false

const isDragging = ref(false)
const isSnapping = ref(false)
const dragOffset = ref(0)

const trackPosition = ref(0)
watch(
  slides,
  async (list) => {
    await nextTick()
    trackPosition.value = list.length > 1 ? safeIndex.value + 1 : safeIndex.value
  },
  { immediate: true },
)

const trackStyle = computed(() => ({
  transform: `translateX(calc(${-trackPosition.value} * (100% + ${TRACK_GAP_PX}px) + ${dragOffset.value}px))`,
}))

function handlePointerDown(event) {
  isPointerDown = true
  pointerStartX = event.clientX
  pointerStartY = event.clientY
}

function handlePointerMove(event) {
  if (!isPointerDown) return
  const deltaX = event.clientX - pointerStartX
  const deltaY = event.clientY - pointerStartY

  if (!isDragging.value) {
    if (Math.abs(deltaX) < DRAG_START_THRESHOLD_PX || Math.abs(deltaX) < Math.abs(deltaY)) return
    isDragging.value = true
  }

  dragOffset.value = deltaX
}

function handlePointerUp(event) {
  if (!isPointerDown) return
  isPointerDown = false
  if (!isDragging.value) return
  isDragging.value = false

  const deltaX = event.clientX - pointerStartX
  const moved = Math.abs(deltaX) >= SWIPE_THRESHOLD_PX && goToOffset(deltaX < 0 ? 1 : -1)
  if (moved) suppressNextClick = true
  dragOffset.value = 0
}

function handlePointerCancel() {
  isPointerDown = false
  isDragging.value = false
  dragOffset.value = 0
}

function suppressClickAfterSwipe(event) {
  if (!suppressNextClick) return
  suppressNextClick = false
  event.stopPropagation()
  event.preventDefault()
}

function goToOffset(offset) {
  const length = orderedList.value.length
  if (length <= 1) return false

  const rawNext = safeIndex.value + offset
  const wrapping = rawNext < 0 || rawNext >= length
  const nextIndex = (rawNext + length) % length

  trackPosition.value = wrapping ? (offset > 0 ? length + 1 : 0) : nextIndex + 1
  currentIndex.value = nextIndex
  return true
}

function handleTrackTransitionEnd(event) {
  if (event.target !== event.currentTarget || event.propertyName !== 'transform') return

  const length = orderedList.value.length
  let snapTo = null
  if (trackPosition.value === length + 1) snapTo = 1
  else if (trackPosition.value === 0) snapTo = length

  if (snapTo === null) return
  isSnapping.value = true
  trackPosition.value = snapTo
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      isSnapping.value = false
    })
  })
}
</script>

<template>
  <div
    class="recommendation-detail-view"
    :class="{ 'recommendation-detail-view--animated': hasAnyRecommendation }"
  >
    <AppHeader title="진단 결과" :show-back="false" />

    <div v-if="goalStore.isRecommending" class="recommendation-detail-view__skeleton">
      <BaseSkeleton height="56px" radius="16px" />
      <BaseSkeleton height="160px" radius="16px" />
      <BaseSkeleton height="120px" radius="16px" />
      <BaseSkeleton height="280px" radius="16px" />
    </div>

    <div v-else-if="goalStore.recommendError" class="recommendation-detail-view__state">
      <BaseEmptyState message="계획을 불러오지 못했어요. 잠시 후 다시 시도해주세요." />
      <BaseButton size="lg" @click="goalStore.loadRecommendationResult">다시 시도</BaseButton>
    </div>

    <div v-else-if="!hasAnyRecommendation" class="recommendation-detail-view__state">
      <BaseEmptyState message="조건에 맞는 계획을 찾지 못했어요." />
      <BaseButton variant="secondary" size="lg" @click="goToDiagnosis">다시 진단하기</BaseButton>
    </div>

    <template v-else>
      <div v-if="total > 1" class="recommendation-detail-view__carousel-head">
        <div class="recommendation-detail-view__dots">
          <span
            v-for="(item, index) in orderedList"
            :key="item.type"
            class="recommendation-detail-view__dot"
            :class="{ 'recommendation-detail-view__dot--active': index === safeIndex }"
          />
        </div>
        <p class="recommendation-detail-view__carousel-hint">
          <strong>{{ safeIndex + 1 }} / {{ total }}</strong> · 옆으로 넘기면 다른 방법도 볼 수
          있어요
        </p>
      </div>

      <div
        class="recommendation-detail-view__swipe-area"
        :style="{ height: trackHeight ? `${trackHeight}px` : undefined }"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="handlePointerUp"
        @pointercancel="handlePointerCancel"
        @click.capture="suppressClickAfterSwipe"
      >
        <div
          class="recommendation-detail-view__track"
          :class="{ 'recommendation-detail-view__track--dragging': isDragging || isSnapping }"
          :style="trackStyle"
          @transitionend="handleTrackTransitionEnd"
        >
          <div
            v-for="slide in loopSlides"
            :key="slide.key ?? slide.type"
            :ref="(el) => !slide.key && setSlideRef(el, slide.type)"
            class="recommendation-detail-view__slide"
            :class="{
              'recommendation-detail-view__slide--active': slide.type === currentSlide?.type,
            }"
          >
            <div class="recommendation-detail-view__card-intro">
              <h2 class="recommendation-detail-view__title">{{ slide.title }}</h2>
              <p class="recommendation-detail-view__description">{{ slide.description }}</p>
            </div>

            <div class="recommendation-detail-view__cards">
              <RecommendationHousingCard
                :condition="slide.recommendation.condition"
                :target-date="slide.recommendation.loanX.targetDate"
              />
              <RecommendationCompareCard
                v-if="slide.compareView"
                :title="slide.compareView.title"
                :rows="slide.compareView.rows"
              />

              <template v-if="slide.loanCards.length > 0">
                <p class="recommendation-detail-view__section-title">
                  이 목표에 활용할 수 있는 대출
                </p>
                <RecommendationLoanTabs
                  :model-value="selectedLoanIndexFor(slide.type)"
                  :loans="slide.loanCards"
                  @update:model-value="(index) => (selectedLoanIndexByType[slide.type] = index)"
                />
                <RecommendationLoanCard
                  v-if="slide.loanCards[selectedLoanIndexFor(slide.type)]"
                  :loan="slide.loanCards[selectedLoanIndexFor(slide.type)]"
                />
              </template>
            </div>
          </div>
        </div>
      </div>

      <div
        class="recommendation-detail-view__footer"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="handlePointerUp"
        @pointercancel="handlePointerCancel"
        @click.capture="suppressClickAfterSwipe"
      >
        <BaseButton size="lg" @click="handleSetAsGoal"> 이 계획으로 목표 설정하기 </BaseButton>
        <button
          type="button"
          class="recommendation-detail-view__diagnose-again"
          @click="goToDiagnosis"
        >
          다시 진단하기
        </button>
      </div>

      <GoalConfirmModal
        v-model="isConfirmOpen"
        :recommendation="recommendation"
        :selected-loan="selectedLoan"
        :is-saving="goalStore.isSaving"
        :save-error="goalStore.saveError"
        @confirm="confirmAndSaveGoal"
      />
    </template>
  </div>
</template>

<style scoped>
.recommendation-detail-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 140px;
}

.recommendation-detail-view__skeleton {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recommendation-detail-view__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding-top: 16px;
}

.recommendation-detail-view__carousel-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.recommendation-detail-view__dots {
  display: flex;
  align-items: center;
  gap: 6px;
}

.recommendation-detail-view__dot {
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background: var(--color-border, #262626);
}

.recommendation-detail-view__dot--active {
  width: 18px;
  background: var(--color-primary, #1d6b3f);
}

.recommendation-detail-view__carousel-hint {
  margin: 0;
  font-size: 11.5px;
  color: var(--color-text-tertiary, #6f766d);
}

.recommendation-detail-view__carousel-hint strong {
  color: var(--color-text-secondary, #9aa09a);
  font-weight: 700;
}

.recommendation-detail-view__swipe-area {
  overflow: hidden;
  touch-action: pan-y;
  transition: height 0.32s cubic-bezier(0.22, 1, 0.36, 1);
  padding: 0 32px;
}

.recommendation-detail-view__track {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}

.recommendation-detail-view__track--dragging {
  transition: none;
}

.recommendation-detail-view__slide {
  flex: 0 0 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  opacity: 0.55;
  transform: scale(0.94);
  transition:
    opacity 0.32s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
}

.recommendation-detail-view__slide--active {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
}

.recommendation-detail-view__card-intro {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.recommendation-detail-view__title {
  margin: 0;
  font-size: 23px;
  font-weight: 800;
  line-height: 1.35;
  letter-spacing: -0.4px;
  color: var(--color-text-primary, #ffffff);
}

.recommendation-detail-view__description {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-text-secondary, #9aa09a);
}

.recommendation-detail-view__cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recommendation-detail-view__section-title {
  margin: 4px 0 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-secondary, #9aa09a);
}

.recommendation-detail-view__footer {
  position: fixed;
  left: 50%;
  bottom: 0;
  z-index: 4;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: calc(100% - 32px);
  max-width: 368px;
  padding: 12px 0 calc(12px + env(safe-area-inset-bottom, 0px));
  background: var(--color-app-bg, #111111);
  transform: translateX(-50%);
  touch-action: pan-y;
}

.recommendation-detail-view__footer::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 100%;
  height: 28px;
  background: linear-gradient(to bottom, transparent, var(--color-app-bg, #111111));
  pointer-events: none;
}

.recommendation-detail-view__diagnose-again {
  border: 0;
  padding: 4px;
  background: none;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-primary, #1d6b3f);
  text-decoration: underline;
  cursor: pointer;
}

.recommendation-detail-view--animated > *:not(.recommendation-detail-view__footer) {
  animation: card-rise 0.35s ease-out both;
}

.recommendation-detail-view--animated > *:nth-child(2) {
  animation-delay: 0.06s;
}

.recommendation-detail-view--animated > *:nth-child(3) {
  animation-delay: 0.12s;
}

@media (prefers-reduced-motion: reduce) {
  .recommendation-detail-view__track,
  .recommendation-detail-view__swipe-area,
  .recommendation-detail-view__slide {
    transition: none;
  }
}
</style>
