<script setup>
import { reactive, computed } from 'vue'

import BaseChipGroup from '@/shared/components/atoms/form/ChipGroup/BaseChipGroup.vue'
import BaseDualRangeSlider from '@/shared/components/atoms/form/RangeSlider/BaseDualRangeSlider.vue'
import BaseYearMonthSelect from '@/shared/components/atoms/form/YearMonthSelect/BaseYearMonthSelect.vue'
import BaseInputField from '@/shared/components/molecules/BaseInputField.vue'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'
import { formatEok, formatManwon } from '@/shared/utils/formatter'

import RegionSelect from '@/features/goal/components/RegionSelect.vue'
import { useGoalStore } from '@/features/goal/store/goalStore'
import { getRegionLabel } from '@/shared/constants/regions'

// label은 화면 표시용 한글, value는 백엔드 진단 API가 기대하는 propertyType/tradeType enum 그대로 사용한다.
const HOUSING_TYPE_OPTIONS = [
  { label: '아파트', value: 'APT' },
  { label: '오피스텔', value: 'OFFICETEL' },
  { label: '연립·다세대', value: 'ROW_HOUSE' },
  { label: '단독·다가구', value: 'DETACHED' },
]

const DEAL_TYPE_OPTIONS = [
  { label: '전세', value: 'JEONSE' },
  { label: '월세', value: 'WOLSE' },
]

const form = reactive({
  region: null,
  housingType: null,
  dealType: null,
  area: { min: 10, max: 20 },
  deposit: { min: 300000000, max: 600000000 },
  monthlyRent: { min: 300000, max: 800000 },
  monthlySaving: '',
  targetDate: '', // BaseYearMonthSelect가 마운트 시 다음 달로 자동 보정한다
})

const emit = defineEmits(['submitted'])

const goalStore = useGoalStore()

const isMonthlyRent = computed(() => form.dealType === 'WOLSE')

// 진단 결과 팝업 상단 조건 요약줄("강남구 · 오피스텔 · 전세 · 10~20평")에 사용.
// form.housingType/dealType은 이제 enum 값이라, 화면에는 옵션 목록에서 라벨을 찾아 보여준다.
const conditionSummary = computed(() => {
  const regionLabel = form.region ? getRegionLabel(form.region) : ''
  const housingLabel =
    HOUSING_TYPE_OPTIONS.find((option) => option.value === form.housingType)?.label ?? ''
  const dealLabel = DEAL_TYPE_OPTIONS.find((option) => option.value === form.dealType)?.label ?? ''
  return `${regionLabel} · ${housingLabel} · ${dealLabel} · ${form.area.min}~${form.area.max}평`
})

function formatPyeong(value) {
  return `${value}평`
}

async function onSubmit() {
  const payload = {
    region: form.region,
    housingType: form.housingType,
    dealType: form.dealType,
    areaMin: form.area.min,
    areaMax: form.area.max,
    depositMin: form.deposit.min,
    depositMax: form.deposit.max,
    monthlyRentMin: isMonthlyRent.value ? form.monthlyRent.min : null,
    monthlyRentMax: isMonthlyRent.value ? form.monthlyRent.max : null,
    monthlySaving: Number(form.monthlySaving),
    targetDate: form.targetDate,
  }

  await goalStore.submitDiagnosis(payload)
  emit('submitted', { conditionSummary: conditionSummary.value, payload })
}
</script>

<template>
  <form class="diagnosis-form" @submit.prevent="onSubmit">
    <RegionSelect v-model="form.region" />

    <BaseChipGroup
      v-model="form.housingType"
      label="주거 형태"
      :options="HOUSING_TYPE_OPTIONS"
      size="sm"
    />

    <BaseChipGroup
      v-model="form.dealType"
      label="거래 유형"
      :options="DEAL_TYPE_OPTIONS"
      size="sm"
    />

    <BaseDualRangeSlider
      v-model="form.area"
      label="희망 평수 (범위)"
      :min="1"
      :max="50"
      :step="1"
      :format-value="formatPyeong"
    />

    <BaseDualRangeSlider
      v-model="form.deposit"
      label="희망 보증금 (범위)"
      :min="0"
      :max="1000000000"
      :step="10000000"
      :format-value="formatEok"
    />

    <BaseDualRangeSlider
      v-if="isMonthlyRent"
      v-model="form.monthlyRent"
      label="희망 월세 (범위)"
      :min="0"
      :max="2000000"
      :step="100000"
      :format-value="formatManwon"
    />

    <BaseInputField v-model="form.monthlySaving" label="월 저축액" type="number" placeholder="0">
      <template #suffix>
        <span class="diagnosis-form__suffix">원</span>
      </template>
    </BaseInputField>

    <BaseYearMonthSelect v-model="form.targetDate" label="목표 시점" />

    <BaseButton
      class="diagnosis-form__submit"
      type="submit"
      variant="primary"
      size="lg"
      :disabled="goalStore.isSubmitting"
    >
      진단하기
    </BaseButton>
  </form>
</template>

<style scoped>
.diagnosis-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.diagnosis-form__suffix {
  color: var(--text, #9aa09a);
  font-size: 14px;
}

/* BaseButton의 공용 primary 색상(다른 화면과 공유)과 별개로 이 화면의 제출 버튼만 색을 지정한다 */
:deep(.diagnosis-form__submit.base-button--primary) {
  background: #c1e8c8;
}
</style>
