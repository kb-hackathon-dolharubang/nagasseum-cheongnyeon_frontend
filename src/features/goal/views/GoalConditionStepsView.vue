<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppHeader from '@/shared/components/molecules/AppHeader.vue'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'

import GoalStepProgress from '@/features/goal/components/steps/GoalStepProgress.vue'
import GoalStepFrame from '@/features/goal/components/steps/GoalStepFrame.vue'
import GoalRegionStep from '@/features/goal/components/steps/GoalRegionStep.vue'
import GoalChoiceStep from '@/features/goal/components/steps/GoalChoiceStep.vue'
import GoalRangeStep from '@/features/goal/components/steps/GoalRangeStep.vue'
import GoalTargetDateStep from '@/features/goal/components/steps/GoalTargetDateStep.vue'
import GoalMonthlySavingStep from '@/features/goal/components/steps/GoalMonthlySavingStep.vue'
import GoalRecommendationLoading from '@/features/goal/components/steps/GoalRecommendationLoading.vue'
import { useGoalConditionSteps } from '@/features/goal/composables/useGoalConditionSteps'
import { useGoalStore } from '@/features/goal/store/goalStore'

const props = defineProps({
  goalId: { type: [String, Number], default: null },
})

const router = useRouter()
const goalStore = useGoalStore()

const isEditMode = computed(() => props.goalId !== null)
const cameFromDiagnosisResult = window.history.state?.fromDiagnosisResult === true

const {
  form,
  currentStep,
  currentIndex,
  totalSteps,
  isFirstStep,
  isLastStep,
  canGoNext,
  canSkip,
  goNext,
  goPrev,
  goFirst,
  skip,
  applyInitialValue,
  buildPayload,
} = useGoalConditionSteps()

goalStore.editingGoalId = props.goalId ?? null

const editLoadState = ref(isEditMode.value ? 'loading' : 'ready')

onMounted(async () => {
  if (!isEditMode.value) return

  const loaded = await goalStore.loadGoal(props.goalId)
  if (!loaded) {
    editLoadState.value = 'error'
    return
  }

  applyInitialValue(goalStore.goalForEdit)
  editLoadState.value = 'ready'
})

const RESULT_ROUTE_NAME = 'goal-recommendations'

const phase = ref('steps')
const transitionName = ref('goal-step-forward')

function handleBack() {
  if (phase.value !== 'steps') {
    phase.value = 'steps'
    return
  }
  if (isFirstStep.value) {
    if (cameFromDiagnosisResult) router.replace({ name: 'home' })
    else router.back()
    return
  }
  transitionName.value = 'goal-step-backward'
  goPrev()
}

function restartSteps() {
  transitionName.value = 'goal-step-backward'
  goFirst()
  phase.value = 'steps'
}

async function submit() {
  phase.value = 'loading'

  const succeeded = await goalStore.loadRecommendations(buildPayload())
  if (!succeeded) {
    phase.value = 'error'
    return
  }

  try {
    await router.replace({ name: RESULT_ROUTE_NAME })
  } catch {
    console.error(
      `[goal] '${RESULT_ROUTE_NAME}' 라우트가 아직 등록되지 않았습니다. 추천 결과 화면을 라우터에 추가해주세요.`,
    )
  }
}

function handleNext() {
  transitionName.value = 'goal-step-forward'
  if (goNext()) submit()
}

function handleSkip() {
  transitionName.value = 'goal-step-forward'
  if (skip()) submit()
}
</script>

<template>
  <div class="goal-steps-view">
    <AppHeader
      :title="isEditMode ? '목표 수정' : '목표 설정'"
      :show-back="phase !== 'loading'"
      @back="handleBack"
    />

    <p v-if="editLoadState === 'loading'" class="goal-steps-view__status">
      목표를 불러오는 중이에요…
    </p>

    <div v-else-if="editLoadState === 'error'" class="goal-steps-view__result">
      <h2 class="goal-steps-view__result-title">목표를 불러오지 못했어요</h2>
      <p class="goal-steps-view__result-description">
        {{ goalStore.goalLoadError?.message ?? '잠시 후 다시 시도해 주세요.' }}
      </p>
      <div class="goal-steps-view__footer">
        <BaseButton size="lg" @click="router.back()">돌아가기</BaseButton>
      </div>
    </div>

    <template v-else-if="phase === 'steps'">
      <GoalStepProgress
        class="goal-steps-view__progress"
        :current="currentIndex + 1"
        :total="totalSteps"
      />

      <div class="goal-steps-view__body">
        <Transition :name="transitionName" mode="out-in">
          <GoalStepFrame
            :key="currentStep.key"
            :title="currentStep.title"
            :description="currentStep.description"
          >
            <GoalRegionStep
              v-if="currentStep.kind === 'region'"
              v-model="form.regionCode"
              v-model:dong-code="form.dongCode"
            />

            <GoalChoiceStep
              v-else-if="currentStep.kind === 'choice'"
              v-model="form[currentStep.key]"
              :options="currentStep.options"
            />

            <GoalRangeStep
              v-else-if="currentStep.kind === 'range'"
              v-model="form[currentStep.field]"
              :min="currentStep.min"
              :max="currentStep.max"
              :step="currentStep.step"
              :format-value="currentStep.formatValue"
            />

            <GoalMonthlySavingStep
              v-else-if="currentStep.kind === 'amount'"
              v-model="form.monthlySaving"
            />

            <GoalTargetDateStep v-else v-model="form.targetDate" />
          </GoalStepFrame>
        </Transition>
      </div>

      <div class="goal-steps-view__footer">
        <BaseButton size="lg" :disabled="!canGoNext" @click="handleNext">
          {{ isLastStep ? '목표 찾기' : '다음' }}
        </BaseButton>
        <button v-if="canSkip" type="button" class="goal-steps-view__skip" @click="handleSkip">
          {{ isLastStep ? '이 조건 건너뛰고 목표 찾기' : '이 조건은 건너뛸게요' }}
        </button>
        <span v-else class="goal-steps-view__skip-placeholder" />
      </div>
    </template>

    <GoalRecommendationLoading v-else-if="phase === 'loading'" />

    <div v-else class="goal-steps-view__result">
      <h2 class="goal-steps-view__result-title">추천을 불러오지 못했어요</h2>
      <p class="goal-steps-view__result-description">
        {{ goalStore.recommendError?.message ?? '잠시 후 다시 시도해 주세요.' }}
      </p>

      <div class="goal-steps-view__footer">
        <BaseButton size="lg" @click="submit">다시 시도</BaseButton>
        <button type="button" class="goal-steps-view__skip" @click="restartSteps">
          조건 다시 고르기
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.goal-steps-view {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 32px);
}

.goal-steps-view :deep(.range-slider__fill) {
  background: var(--base-button-primary-bg, #e3ffe8);
}

.goal-steps-view__progress {
  position: sticky;
  top: 49px;
  z-index: 4;
  padding: 20px 0 12px;
  background: var(--color-app-bg, #111111);
}

.goal-steps-view__body {
  flex: 1;
  padding: 20px 0 32px;
}

.goal-steps-view__footer {
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

.goal-steps-view__skip {
  padding: 10px 8px;
  border: none;
  background: none;
  color: var(--color-text-tertiary, #6f766d);
  font: inherit;
  font-size: 13.2px;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}

.goal-steps-view__skip-placeholder {
  display: block;
  height: 41px;
}

.goal-steps-view__status {
  padding-top: 48px;
  color: var(--color-text-secondary, #9aa09a);
  text-align: center;
}

.goal-steps-view__result {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 12px;
  padding-top: 48px;
}

.goal-steps-view__result-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: -0.5px;
  color: var(--color-text-primary, #ffffff);
}

.goal-steps-view__result-description {
  margin: 0 0 12px;
  font-size: 13.2px;
  line-height: 1.6;
  color: var(--color-text-secondary, #9aa09a);
}

.goal-steps-view__result .goal-steps-view__footer {
  margin-top: auto;
}

.goal-step-forward-enter-active,
.goal-step-forward-leave-active,
.goal-step-backward-enter-active,
.goal-step-backward-leave-active {
  transition:
    opacity 0.24s ease,
    transform 0.24s ease;
}

.goal-step-forward-enter-from {
  opacity: 0;
  transform: translateX(24px);
}

.goal-step-forward-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}

.goal-step-backward-enter-from {
  opacity: 0;
  transform: translateX(-24px);
}

.goal-step-backward-leave-to {
  opacity: 0;
  transform: translateX(24px);
}

@media (prefers-reduced-motion: reduce) {
  .goal-step-forward-enter-active,
  .goal-step-forward-leave-active,
  .goal-step-backward-enter-active,
  .goal-step-backward-leave-active {
    transition: opacity 0.12s linear;
  }

  .goal-step-forward-enter-from,
  .goal-step-forward-leave-to,
  .goal-step-backward-enter-from,
  .goal-step-backward-leave-to {
    transform: none;
  }
}
</style>
