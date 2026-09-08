<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppHeader from '@/shared/components/molecules/AppHeader.vue'

import HousingGoalDiagnosisForm from '@/features/goal/components/HousingGoalDiagnosisForm.vue'
import DiagnosisResultModal from '@/features/goal/components/DiagnosisResultModal.vue'
import { useGoalStore } from '@/features/goal/store/goalStore'

// goal-edit 라우트(`/goals/:goalId/edit`)로 들어오면 채워지고, 진단(생성)으로 들어오면 비어 있다.
// 값이 있으면 생성(POST)이 아니라 수정(PUT)을 호출해야 한다 — 활성 목표가 이미 있는 상태라
// 생성은 GOAL_003(이미 활성 목표가 존재합니다)으로 거부된다.
const props = defineProps({
  goalId: { type: [String, Number], default: null },
})

const router = useRouter()
const goalStore = useGoalStore()

const isEditMode = computed(() => props.goalId !== null)

const isResultOpen = ref(false)
const conditionSummary = ref('')

function onSubmitted({ conditionSummary: summary }) {
  if (goalStore.error) return

  conditionSummary.value = summary
  isResultOpen.value = true
}

async function onConfirm() {
  // 저장 요청은 폼 입력값이 아니라 진단 응답 필드를 그대로 쓴다 — 백엔드가 정규화해 echo해준
  // regionCode/propertyType/... 값과 진단 시점 예산/중앙값이 실제 저장값과 항상 일치하게 하기 위함.
  const result = goalStore.diagnosisResult
  const payload = {
    regionCode: result.regionCode,
    propertyType: result.propertyType,
    tradeType: result.tradeType,
    sizeMin: result.sizeMin,
    sizeMax: result.sizeMax,
    depositMin: result.depositMin,
    depositMax: result.depositMax,
    monthlyRentMin: result.monthlyRentMin,
    monthlyRentMax: result.monthlyRentMax,
    monthlySavings: result.monthlySavings,
    targetDate: result.targetDate,
    targetAmount: result.budget.totalBudget,
    targetRentMiddleAmount: result.marketStats.median,
  }

  const saved = isEditMode.value
    ? await goalStore.updateGoal(props.goalId, payload)
    : await goalStore.saveGoal(payload)

  if (!saved) return

  isResultOpen.value = false
  // 수정도 생성과 같이 홈으로 보낸다. 홈은 진입할 때마다 요약을 다시 불러오므로 바뀐 목표가 바로 보인다.
  router.push({ name: 'home' })
}
</script>

<template>
  <div class="diagnosis-view">
    <AppHeader :title="isEditMode ? '목표 수정하기' : '목표 진단하기'" @back="router.back()" />
    <div class="diagnosis-view__content">
      <HousingGoalDiagnosisForm @submitted="onSubmitted" />
      <p v-if="goalStore.error" class="diagnosis-view__error">
        {{ goalStore.error?.message ?? '진단 결과를 불러오지 못했어요.' }}
      </p>
      <p v-if="goalStore.saveError" class="diagnosis-view__error">
        {{ goalStore.saveError?.message ?? '목표 저장에 실패했어요.' }}
      </p>
    </div>

    <DiagnosisResultModal
      v-model="isResultOpen"
      :condition-summary="conditionSummary"
      :result="goalStore.diagnosisResult"
      :is-saving="goalStore.isSaving"
      @confirm="onConfirm"
    />
  </div>
</template>

<style scoped>
.diagnosis-view {
  display: flex;
  flex-direction: column;
}

.diagnosis-view__content {
  padding: 20px;
}

.diagnosis-view__error {
  margin-top: 16px;
  color: var(--color-point, #c1442e);
  text-align: center;
}
</style>
