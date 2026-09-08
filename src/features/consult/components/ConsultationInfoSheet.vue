<script setup>
import { computed, reactive, watch } from 'vue'

import BaseBottomSheet from '@/shared/components/atoms/feedback/Sheet/BaseBottomSheet.vue'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'
import BaseInputField from '@/shared/components/molecules/BaseInputField.vue'
import BaseYearMonthSelect from '@/shared/components/atoms/form/YearMonthSelect/BaseYearMonthSelect.vue'
import BaseFieldBadge from '@/shared/components/atoms/base/badge/BaseFieldBadge.vue'
import BaseChipGroup from '@/shared/components/atoms/form/ChipGroup/BaseChipGroup.vue'
import HousingPreferenceSelect from '@/features/consult/components/HousingPreferenceSelect.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false }, // 시트 열림 여부
  // 상담용으로 관리 중인 값(consultationData) - 원본 서비스 데이터가 아니라 이 화면의
  // 로컬 상태를 그대로 받는다. 저장 시 이 원본 shape과 같은 객체를 emit한다.
  initialData: { type: Object, required: true },
})

const emit = defineEmits(['update:modelValue', 'save'])

const LOAN_PREFERENCE_OPTIONS = [
  { label: '있음', value: 'YES' },
  { label: '없음', value: 'NO' },
  { label: '잘 모르겠음', value: 'UNDECIDED' },
]

const draft = reactive({
  // { province, district, neighborhood, housingType, transactionType, areaRange } | null.
  // 6개 값이 모두 갖춰졌을 때만 HousingPreferenceSelect가 객체를 올려주고, 하나라도
  // 비어 있으면 null을 올려준다 - 그래서 완료 여부는 이 값의 존재만 보면 된다.
  housingPreference: null,
  currentAsset: '',
  monthlySaving: '',
  targetDate: '', // 'YYYY-MM' (BaseYearMonthSelect 형식)
  loanPreference: null,
})

// BaseYearMonthSelect는 'YYYY-MM'만 받는다. targetDate가 '2031.08'처럼 점으로 올 수도
// 있어(GOAL_DIAGNOSIS 쪽 원본이 그 형식이다) 구분자만 통일해서 넘긴다.
function toSelectYearMonth(value) {
  return value ? String(value).replace('.', '-') : ''
}

function seedFromInitialData() {
  draft.housingPreference = props.initialData.housingPreference
    ? { ...props.initialData.housingPreference }
    : null
  draft.currentAsset =
    props.initialData.currentAsset != null ? String(props.initialData.currentAsset) : ''
  draft.monthlySaving =
    props.initialData.monthlySaving != null ? String(props.initialData.monthlySaving) : ''
  draft.targetDate = toSelectYearMonth(props.initialData.targetDate)
  draft.loanPreference = props.initialData.loanPreference ?? null
}

// 열 때마다 현재 consultationData로 다시 채운다 - 취소하면 이 draft는 버려지고
// consultationData는 그대로 남는다.
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) seedFromInitialData()
  },
)

const canSave = computed(
  () =>
    Boolean(draft.housingPreference) &&
    draft.currentAsset !== '' &&
    draft.monthlySaving !== '' &&
    draft.targetDate !== '',
)

const hasAllRequiredData = computed(
  () =>
    Boolean(props.initialData.housingPreference) &&
    props.initialData.currentAsset != null &&
    props.initialData.monthlySaving != null &&
    Boolean(props.initialData.targetDate),
)

const title = computed(() => (hasAllRequiredData.value ? '상담 정보 수정' : '상담 정보 입력'))

function close() {
  emit('update:modelValue', false)
}

function save() {
  if (!canSave.value) return

  emit('save', {
    housingPreference: draft.housingPreference,
    currentAsset: Number(draft.currentAsset),
    monthlySaving: Number(draft.monthlySaving),
    targetDate: draft.targetDate,
    loanPreference: draft.loanPreference,
  })
  close()
}
</script>

<template>
  <BaseBottomSheet :model-value="modelValue" :title="title" @update:model-value="close">
    <div class="consultation-info-sheet">
      <div class="consultation-info-sheet__group">
        <div class="consultation-info-sheet__group-head">
          <span class="consultation-info-sheet__group-title">희망 주거 조건</span>
          <BaseFieldBadge :required="true" />
        </div>
        <!-- 그룹 헤더에 이미 '필수' 표시가 있어 하위 select/chip에는 따로 배지를 달지 않는다. -->
        <HousingPreferenceSelect v-model="draft.housingPreference" />
      </div>

      <BaseInputField
        v-model="draft.currentAsset"
        label="현재 자산"
        type="number"
        :required="true"
        placeholder="0"
      >
        <template #suffix>원</template>
      </BaseInputField>

      <BaseInputField
        v-model="draft.monthlySaving"
        label="월 저축 가능액"
        type="number"
        :required="true"
        placeholder="0"
      >
        <template #suffix>원</template>
      </BaseInputField>

      <div class="consultation-info-sheet__group">
        <div class="consultation-info-sheet__group-head">
          <span class="consultation-info-sheet__group-title">목표 시점</span>
          <BaseFieldBadge :required="true" />
        </div>
        <BaseYearMonthSelect v-model="draft.targetDate" />
      </div>

      <div class="consultation-info-sheet__group">
        <span class="consultation-info-sheet__group-title">대출 이용 의향</span>
        <BaseChipGroup
          v-model="draft.loanPreference"
          :options="LOAN_PREFERENCE_OPTIONS"
          size="sm"
        />
      </div>
    </div>

    <template #footer>
      <BaseButton variant="secondary" @click="close">취소</BaseButton>
      <BaseButton variant="primary" :disabled="!canSave" @click="save">저장</BaseButton>
    </template>
  </BaseBottomSheet>
</template>

<style scoped>
/*
  BaseInputField/BaseYearMonthSelect가 테마를 안 타는 legacy 변수(--text-h/--border/--card-bg)를
  쓴다(GoalConditionStepsView와 같은 문제). 컴포넌트를 고치는 대신 이 시트 안에서만
  시맨틱 토큰으로 덮어써서 라이트 모드에서도 값이 제대로 보이게 한다.
*/
.consultation-info-sheet {
  --text-h: var(--color-text-primary);
  --text: var(--color-text-secondary);
  --border: var(--color-border);
  --card-bg: var(--color-app-bg);

  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* BaseInput은 기본 6px radius를 쓰는데, 이 화면의 다른 입력 요소(카드·시트 반경)와
   맞추기 위해 이 시트 안에서만 살짝 키운다. 현재 자산/월 저축 가능액은 "원" suffix가
   입력값과 겹치지 않게 오른쪽 여백도 더 둔다. */
.consultation-info-sheet :deep(.base-input) {
  box-sizing: border-box;
  border-radius: 10px;
}

.consultation-info-sheet :deep(.base-input-field .base-input) {
  padding-right: 32px;
}

.consultation-info-sheet__group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.consultation-info-sheet__group-head {
  display: flex;
  align-items: center;
  gap: 6px;
}

.consultation-info-sheet__group-title {
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}
</style>
