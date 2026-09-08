<script setup>
import { computed } from 'vue'

import BaseInputField from '@/shared/components/molecules/BaseInputField.vue'
import { formatGoalAmount } from '@/shared/utils/formatter'

const props = defineProps({
  // 만원 단위 문자열. 원 단위 변환은 호출부(buildPayload)에서 한다.
  modelValue: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const numericManwon = computed(() => Number(props.modelValue) || 0)

/*
  입력한 만원 값을 "50만 원" / "1억 2,000만 원"처럼 다시 보여준다. 만원 단위로 받으면
  타이핑은 짧지만 자릿수 감각이 사라져서, 0을 하나 더 치거나 덜 쳐도 알아채기 어렵다.
  같은 화면 다른 단계(범위형)도 고른 값을 크게 되짚어주므로 형태를 맞춘다.
*/
const readableAmount = computed(() =>
  numericManwon.value > 0 ? formatGoalAmount(numericManwon.value * 10000) : '',
)

// 서버가 Long으로 받으므로 숫자만 남긴다. 붙여넣기로 들어온 콤마·문자도 여기서 걸러진다.
function onInput(value) {
  emit('update:modelValue', String(value).replace(/\D/g, ''))
}
</script>

<template>
  <div class="goal-monthly-saving-step">
    <p class="goal-monthly-saving-step__value">{{ readableAmount }}</p>

    <BaseInputField
      :model-value="modelValue"
      label="월 저축액"
      required
      type="text"
      inputmode="numeric"
      placeholder="0"
      :show-counter="false"
      helper-text="매달 모을 수 있는 금액이에요. 이 값으로 목표 도달 시점을 계산해요."
      @update:model-value="onInput"
    >
      <template #suffix>만원</template>
    </BaseInputField>
  </div>
</template>

<style scoped>
/*
  필수/선택 배지를 감춘다. 이 단계에는 입력이 하나뿐이라 무엇과 구분하라는 표시인지 알 수 없고,
  비우면 '목표 찾기'가 이미 비활성이라 배지가 더 알려주는 것이 없다. BaseFieldBadge는 칩
  배경색이 다크 기준(#3a1f1f)으로 하드코딩돼 있어 라이트 모드에서 검은 칩이 혼자 떠 보이는
  문제도 있다. 공용 컴포넌트를 고치는 대신 이 단계 안에서만 감춘다.
*/
.goal-monthly-saving-step :deep(.base-field-badge) {
  display: none;
}

.goal-monthly-saving-step {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 비어 있어도 min-height로 자리를 지켜, 입력을 시작할 때 아래 입력칸이 밀리지 않게 한다 */
.goal-monthly-saving-step__value {
  margin: 0;
  min-height: 34px;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--color-heading-accent);
  text-align: center;
}
</style>
