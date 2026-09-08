<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'
import BaseFieldBadge from '@/shared/components/atoms/base/badge/BaseFieldBadge.vue'
import BaseInputField from '@/shared/components/molecules/BaseInputField.vue'
import BaseOptionCardGroup from '@/shared/components/atoms/form/OptionCardGroup/BaseOptionCardGroup.vue'
import BaseToggle from '@/shared/components/atoms/form/Toggle/BaseToggle.vue'
import BaseBreadcrumb from '@/shared/components/atoms/navigation/Breadcrumb/BaseBreadcrumb.vue'
import AppHeader from '@/shared/components/molecules/AppHeader.vue'
import { ONBOARDING_STEPS } from '@/shared/constants/onboardingSteps'
import { INCOME_BRACKET_OPTIONS } from '@/shared/constants/incomeBracket'
import { OCCUPATION_OPTIONS } from '@/shared/constants/occupation'

import { useAuthStore } from '@/features/auth/store/authStore'
import { updateMyInfo } from '@/features/member/api/memberApi'

const router = useRouter()
const authStore = useAuthStore()

const kakaoId = authStore.pendingSignup?.kakaoId ?? null
const nickname = authStore.pendingSignup?.nickname ?? ''
const birthDate = authStore.pendingSignup?.birthDate ?? ''

const incomeBracket = ref(null)
const monthlyIncomeManwon = ref('')
const occupationType = ref(null)
const notificationAgreed = ref(true)
const compareDataAgreed = ref(false)

watch(monthlyIncomeManwon, (value) => {
  const digits = value.replace(/\D/g, '')
  if (digits !== value) monthlyIncomeManwon.value = digits
})

const monthlyIncome = computed(() =>
  monthlyIncomeManwon.value ? Number(monthlyIncomeManwon.value) * 10000 : null,
)

function selectOccupation(value) {
  occupationType.value = occupationType.value === value ? null : value
}

const isSubmitting = ref(false)
const errorMessage = ref(kakaoId ? '' : '잘못된 접근입니다. 카카오 로그인을 다시 시도해주세요.')

const canSubmit = computed(() => !isSubmitting.value)

function goToLogin() {
  router.replace({ name: 'login' })
}

async function saveOptionalProfile() {
  if (monthlyIncome.value == null && occupationType.value == null) return

  await nextTick()

  try {
    await updateMyInfo({
      monthlyIncome: monthlyIncome.value,
      occupationType: occupationType.value,
    })
  } catch (error) {
    console.error(
      '[signup] 월 소득·직업군 저장에 실패했습니다. 마이페이지에서 다시 입력해야 합니다.',
      error,
    )
  }
}

async function handleNext() {
  if (!canSubmit.value) return

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    await authStore.completeKakaoSignup({
      kakaoId,
      nickname,
      birthDate,
      incomeBracket: incomeBracket.value,
      agreements: [
        { agreementType: 'NOTIFICATION', agreed: notificationAgreed.value },
        { agreementType: 'COMPARE_DATA', agreed: compareDataAgreed.value },
      ],
    })
    await saveOptionalProfile()
    router.push({ name: 'deposit-info' })
  } catch (error) {
    errorMessage.value =
      error.response?.data?.error?.message ?? '가입에 실패했습니다. 잠시 후 다시 시도해주세요.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="basic-info-view">
    <AppHeader title="등반 준비" :show-back="false" />
    <BaseBreadcrumb class="basic-info-view__steps" :steps="ONBOARDING_STEPS" :current="2" />

    <template v-if="kakaoId">
      <div class="basic-info-view__body">
        <div class="basic-info-view__intro">
          <h2 class="basic-info-view__title">
            {{ nickname }}님, 반갑습니다!<br />
            기본 정보를 알려주세요
          </h2>
          <p class="basic-info-view__subtitle">맞춤 등반 경로와 청년 정책 추천에 활용됩니다</p>
        </div>

        <section class="basic-info-view__section">
          <div class="basic-info-view__section-label-row">
            <span class="basic-info-view__section-label">소득 분위</span>
            <BaseFieldBadge :required="false" />
          </div>
          <p class="basic-info-view__section-helper">
            맞춤 청년 정책 추천에 활용되며, 언제든지 수정 가능합니다
          </p>
          <BaseOptionCardGroup v-model="incomeBracket" :options="INCOME_BRACKET_OPTIONS" />
        </section>

        <section class="basic-info-view__section">
          <BaseInputField
            v-model="monthlyIncomeManwon"
            label="월 소득"
            :max-length="5"
            :show-counter="false"
            placeholder="만원 단위로 입력"
            helper-text="또래 비교에서 내 소득 구간을 표시하는 데 쓰입니다"
          >
            <template #suffix>만원</template>
          </BaseInputField>
        </section>

        <section class="basic-info-view__section">
          <div class="basic-info-view__section-label-row">
            <span class="basic-info-view__section-label">직업군</span>
            <BaseFieldBadge :required="false" />
          </div>
          <div class="basic-info-view__chips">
            <button
              v-for="option in OCCUPATION_OPTIONS"
              :key="option.value"
              type="button"
              class="basic-info-view__chip"
              :class="{ 'basic-info-view__chip--selected': occupationType === option.value }"
              :aria-pressed="occupationType === option.value"
              @click="selectOccupation(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
          <p class="basic-info-view__section-helper basic-info-view__section-helper--below">
            또래 비교에서 같은 직업군끼리 묶어보는 데 쓰입니다
          </p>
        </section>

        <section class="basic-info-view__section">
          <h3 class="basic-info-view__section-title">알림 설정</h3>

          <div class="basic-info-view__toggle-row">
            <div class="basic-info-view__toggle-text">
              <p class="basic-info-view__toggle-title">알림 받기</p>
              <p class="basic-info-view__toggle-desc">
                저축 현황, 정책 마감 등 주요 소식을 알려드려요
              </p>
            </div>
            <BaseToggle v-model="notificationAgreed" />
          </div>

          <div class="basic-info-view__toggle-row">
            <div class="basic-info-view__toggle-text">
              <p class="basic-info-view__toggle-title">[선택] 또래 비교 데이터 제공</p>
              <p class="basic-info-view__toggle-desc">또래 등반 통계에 익명으로 활용돼요</p>
            </div>
            <BaseToggle v-model="compareDataAgreed" />
          </div>
        </section>
      </div>

      <div class="basic-info-view__footer">
        <p v-if="errorMessage" class="basic-info-view__error">{{ errorMessage }}</p>
        <BaseButton size="lg" :disabled="!canSubmit" @click="handleNext">
          {{ isSubmitting ? '가입 중...' : '다음' }}
        </BaseButton>
      </div>
    </template>

    <div v-else class="basic-info-view__footer">
      <p class="basic-info-view__error">{{ errorMessage }}</p>
      <BaseButton size="lg" @click="goToLogin">로그인 화면으로 돌아가기</BaseButton>
    </div>
  </div>
</template>

<style scoped>
.basic-info-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  padding: 16px 24px 24px;
}

.basic-info-view__steps {
  align-self: center;
}

.basic-info-view__body {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.basic-info-view__intro {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.basic-info-view__title {
  margin: 0;
  font-size: 20.6px;
  font-weight: 500;
  line-height: 1.44;
  letter-spacing: -0.4px;
  color: var(--color-text-primary);
}

.basic-info-view__subtitle {
  margin: 0;
  font-size: 13.1px;
  color: var(--color-text-secondary);
}

.basic-info-view__section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.basic-info-view__section-label-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.basic-info-view__section-label,
.basic-info-view__section-title {
  font-size: 13.2px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.basic-info-view__section-helper {
  margin: -8px 0 0;
  font-size: 11.1px;
  color: var(--color-text-secondary);
}

.basic-info-view__section-helper--below {
  margin: -10px 0 0;
}

.basic-info-view__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.basic-info-view__chip {
  padding: 7px 12px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.2;
  cursor: pointer;
}

.basic-info-view__chip--selected {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
  color: var(--color-mint-deep, #16281c);
}

.basic-info-view__toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.basic-info-view__toggle-title {
  margin: 0;
  font-size: 14.1px;
  color: var(--color-text-primary);
}

.basic-info-view__toggle-desc {
  margin: 4px 0 0;
  font-size: 11.1px;
  color: var(--color-text-secondary);
}

.basic-info-view__footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.basic-info-view__error {
  margin: 0;
  font-size: 13px;
  color: #e03131;
}
</style>
