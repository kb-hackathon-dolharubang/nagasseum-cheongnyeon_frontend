<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'
import BaseBreadcrumb from '@/shared/components/atoms/navigation/Breadcrumb/BaseBreadcrumb.vue'
import BaseInputField from '@/shared/components/molecules/BaseInputField.vue'
import AppHeader from '@/shared/components/molecules/AppHeader.vue'
import { ONBOARDING_STEPS } from '@/shared/constants/onboardingSteps'
import { formatNumber } from '@/shared/utils/formatter'

import { createManualDepositAsset } from '@/features/auth/api/authApi'

const MAX_AMOUNT = 10 ** 18

const router = useRouter()

const amount = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')

const numericAmount = computed(() => Number(amount.value.replace(/,/g, '')) || 0)
const canSubmit = computed(() => !isSubmitting.value && numericAmount.value > 0)

function handleAmountInput(value) {
  const digits = String(value).replace(/\D/g, '')
  if (!digits) {
    amount.value = ''
    return
  }

  const capped = Math.min(Number(digits), MAX_AMOUNT)
  amount.value = formatNumber(capped)
}

async function handleNext() {
  if (!canSubmit.value) return

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    await createManualDepositAsset({ amount: numericAmount.value })
    router.push({ name: 'asset-link' })
  } catch (error) {
    errorMessage.value =
      error.response?.data?.error?.message ?? '저장에 실패했습니다. 잠시 후 다시 시도해주세요.'
  } finally {
    isSubmitting.value = false
  }
}

function handleSkip() {
  if (isSubmitting.value) return
  router.push({ name: 'asset-link' })
}
</script>

<template>
  <div class="deposit-info-view">
    <AppHeader title="자산 연동" :show-back="false" />
    <BaseBreadcrumb class="deposit-info-view__steps" :steps="ONBOARDING_STEPS" :current="3" />

    <div class="deposit-info-view__body">
      <div class="deposit-info-view__intro">
        <h2 class="deposit-info-view__title">현재 거주 중인 집의<br />보증금을 알려주세요</h2>
        <p class="deposit-info-view__subtitle">
          전월세 보증금은 자산 연동으로 확인할 수 없어 직접 입력이 필요해요
        </p>
      </div>

      <BaseInputField
        :model-value="amount"
        label="현재 거주 보증금"
        type="text"
        placeholder="0"
        @update:model-value="handleAmountInput"
      >
        <template #suffix>
          <span class="deposit-info-view__suffix">원</span>
        </template>
      </BaseInputField>
    </div>

    <div class="deposit-info-view__footer">
      <p v-if="errorMessage" class="deposit-info-view__error">{{ errorMessage }}</p>
      <BaseButton size="lg" :disabled="!canSubmit" @click="handleNext">
        {{ isSubmitting ? '저장 중...' : '다음' }}
      </BaseButton>
      <BaseButton size="lg" variant="secondary" :disabled="isSubmitting" @click="handleSkip">
        해당 없음
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.deposit-info-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  padding: 16px 24px 24px;
}

.deposit-info-view__steps {
  align-self: center;
}

.deposit-info-view__body {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.deposit-info-view__intro {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.deposit-info-view__title {
  margin: 0;
  font-size: 20.6px;
  font-weight: 500;
  line-height: 1.44;
  letter-spacing: -0.4px;
  color: var(--color-text-primary);
}

.deposit-info-view__subtitle {
  margin: 0;
  font-size: 13.1px;
  color: var(--color-text-secondary);
}

.deposit-info-view :deep(.base-input) {
  text-align: right;
  padding-right: 40px;
}

.deposit-info-view__suffix {
  color: var(--color-text-secondary);
  font-size: 14px;
}

.deposit-info-view__footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.deposit-info-view__error {
  margin: 0;
  font-size: 13px;
  color: #e03131;
}
</style>
