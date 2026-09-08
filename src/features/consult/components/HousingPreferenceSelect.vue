<script setup>
import { computed, ref } from 'vue'

import BaseChipGroup from '@/shared/components/atoms/form/ChipGroup/BaseChipGroup.vue'
import { SIDO_LIST, GUGUN_BY_SIDO, DONG_BY_GUGUN } from '@/shared/constants/regions'

// 주거 형태/거래 유형은 goal 기능의 HousingGoalDiagnosisForm이 이미 쓰는 enum과 라벨을
// 그대로 맞춘다(APT/OFFICETEL/ROW_HOUSE/DETACHED, JEONSE/WOLSE) - 그 컴포넌트는
// goal 내부 파일이라 그대로 import할 수 없어(다른 기능 barrel에 없음) 값만 그대로 옮겼다.
const HOUSING_TYPE_OPTIONS = [
  { label: '아파트', value: 'APT' },
  { label: '오피스텔', value: 'OFFICETEL' },
  { label: '연립·다세대', value: 'ROW_HOUSE' },
  { label: '단독·다가구', value: 'DETACHED' },
]

const TRANSACTION_TYPE_OPTIONS = [
  { label: '전세', value: 'JEONSE' },
  { label: '월세', value: 'WOLSE' },
]

const AREA_RANGE_OPTIONS = [
  { value: '4_9', label: '4~9평', min: 4, max: 9 },
  { value: '10_20', label: '10~20평', min: 10, max: 20 },
  { value: '21_30', label: '21~30평', min: 21, max: 30 },
  { value: '31_40', label: '31~40평', min: 31, max: 40 },
  { value: '40_PLUS', label: '40평 이상', min: 40, max: null },
]

const props = defineProps({
  // { province: {code,name}, district: {code,name}, neighborhood: {code,name},
  //   housingType, transactionType, areaRange: {min,max,label} } | null
  modelValue: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue'])

const sidoCode = ref(props.modelValue?.province?.code ?? '')
const gugunCode = ref(props.modelValue?.district?.code ?? '')
const dongCode = ref(props.modelValue?.neighborhood?.code ?? '')
const housingType = ref(props.modelValue?.housingType ?? null)
const transactionType = ref(props.modelValue?.transactionType ?? null)
const areaRangeValue = ref(
  AREA_RANGE_OPTIONS.find(
    (option) =>
      option.min === props.modelValue?.areaRange?.min &&
      option.max === props.modelValue?.areaRange?.max,
  )?.value ?? null,
)

const gugunOptions = computed(() => GUGUN_BY_SIDO[sidoCode.value] ?? [])
const dongOptions = computed(() => DONG_BY_GUGUN[gugunCode.value] ?? [])

// 6개 값이 모두 있어야 완성된 희망 주거 조건으로 본다. 하나라도 비어 있으면 상위(부모)
// 화면의 저장 검증이 실패하도록 null을 올려보낸다.
function emitUpdate() {
  const sido = SIDO_LIST.find((item) => item.code === sidoCode.value)
  const gugun = gugunOptions.value.find((item) => item.code === gugunCode.value)
  const dong = dongOptions.value.find((item) => item.code === dongCode.value)
  const areaPreset = AREA_RANGE_OPTIONS.find((item) => item.value === areaRangeValue.value)

  const isComplete = Boolean(
    sido && gugun && dong && housingType.value && transactionType.value && areaPreset,
  )

  emit(
    'update:modelValue',
    isComplete
      ? {
          province: { code: sido.code, name: sido.name },
          district: { code: gugun.code, name: gugun.name },
          neighborhood: { code: dong.code, name: dong.name },
          housingType: housingType.value,
          transactionType: transactionType.value,
          areaRange: { min: areaPreset.min, max: areaPreset.max, label: areaPreset.label },
        }
      : null,
  )
}

function onSidoChange(event) {
  sidoCode.value = event.target.value
  // 상위 지역이 바뀌면 더 이상 유효하지 않은 하위 선택은 초기화한다.
  gugunCode.value = ''
  dongCode.value = ''
  emitUpdate()
}

function onGugunChange(event) {
  gugunCode.value = event.target.value
  dongCode.value = ''
  emitUpdate()
}

function onDongChange(event) {
  dongCode.value = event.target.value
  emitUpdate()
}

function selectHousingType(value) {
  housingType.value = value
  emitUpdate()
}

function selectTransactionType(value) {
  transactionType.value = value
  emitUpdate()
}

function selectAreaRange(value) {
  areaRangeValue.value = value
  emitUpdate()
}
</script>

<template>
  <div class="housing-preference-select">
    <div class="housing-preference-select__field">
      <span class="housing-preference-select__label">시·도</span>
      <select class="housing-preference-select__select" :value="sidoCode" @change="onSidoChange">
        <option value="" disabled>지역을 선택해주세요</option>
        <option v-for="sido in SIDO_LIST" :key="sido.code" :value="sido.code">
          {{ sido.name }}
        </option>
      </select>
    </div>

    <div class="housing-preference-select__field">
      <span class="housing-preference-select__label">시·군·구</span>
      <select
        v-if="gugunOptions.length"
        class="housing-preference-select__select"
        :value="gugunCode"
        @change="onGugunChange"
      >
        <option value="" disabled>시·군·구를 선택해주세요</option>
        <option v-for="gugun in gugunOptions" :key="gugun.code" :value="gugun.code">
          {{ gugun.name }}
        </option>
      </select>
      <select v-else class="housing-preference-select__select" disabled>
        <option>
          {{ sidoCode ? '해당 지역의 시·군·구 정보는 준비 중이에요' : '시·도를 먼저 선택해주세요' }}
        </option>
      </select>
    </div>

    <div class="housing-preference-select__field">
      <span class="housing-preference-select__label">읍·면·동</span>
      <select
        v-if="dongOptions.length"
        class="housing-preference-select__select"
        :value="dongCode"
        @change="onDongChange"
      >
        <option value="" disabled>읍·면·동을 선택해주세요</option>
        <option v-for="dong in dongOptions" :key="dong.code" :value="dong.code">
          {{ dong.name }}
        </option>
      </select>
      <select v-else class="housing-preference-select__select" disabled>
        <option>
          {{
            gugunCode ? '해당 지역의 읍·면·동 정보는 준비 중이에요' : '시·군·구를 먼저 선택해주세요'
          }}
        </option>
      </select>
    </div>

    <div class="housing-preference-select__field">
      <span class="housing-preference-select__label">주거 형태</span>
      <BaseChipGroup
        :model-value="housingType"
        :options="HOUSING_TYPE_OPTIONS"
        size="sm"
        @update:model-value="selectHousingType"
      />
    </div>

    <div class="housing-preference-select__field">
      <span class="housing-preference-select__label">거래 유형</span>
      <BaseChipGroup
        :model-value="transactionType"
        :options="TRANSACTION_TYPE_OPTIONS"
        size="sm"
        @update:model-value="selectTransactionType"
      />
    </div>

    <div class="housing-preference-select__field">
      <span class="housing-preference-select__label">희망 면적</span>
      <BaseChipGroup
        :model-value="areaRangeValue"
        :options="AREA_RANGE_OPTIONS"
        size="sm"
        @update:model-value="selectAreaRange"
      />
    </div>
  </div>
</template>

<style scoped>
.housing-preference-select {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.housing-preference-select__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.housing-preference-select__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary, #9aa09a);
}

/* BaseYearMonthSelect/RegionSelect와 같은 select 스타일(패딩·radius·톤)을 그대로 맞춘다. */
.housing-preference-select__select {
  width: 100%;
  padding: 14px 16px;
  border: none;
  border-radius: 15px;
  background: var(--card-bg, #161616);
  color: var(--text-h, #ffffff);
  font: inherit;
  font-weight: 700;
  box-sizing: border-box;
  cursor: pointer;
}

.housing-preference-select__select:disabled {
  color: var(--text, #9aa09a);
  cursor: not-allowed;
}
</style>
