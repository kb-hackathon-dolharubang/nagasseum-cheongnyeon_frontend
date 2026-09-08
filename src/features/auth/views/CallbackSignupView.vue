<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'
import BaseBreadcrumb from '@/shared/components/atoms/navigation/Breadcrumb/BaseBreadcrumb.vue'
import BaseInputField from '@/shared/components/molecules/BaseInputField.vue'
import AppHeader from '@/shared/components/molecules/AppHeader.vue'
import { ONBOARDING_STEPS } from '@/shared/constants/onboardingSteps'
import { isValidBirthDate } from '@/shared/utils/validator'

import { useAuthStore } from '@/features/auth/store/authStore'

const NICKNAME_MAX_LENGTH = 12
const BIRTH_DATE_LENGTH = 6
const NICKNAME_PATTERN = /^[가-힣a-zA-Z0-9]{2,12}$/

const router = useRouter()
const authStore = useAuthStore()

const kakaoId = authStore.pendingSignup?.kakaoId ?? null
const nickname = ref(authStore.pendingSignup?.nickname ?? '')
const birthDate = ref(authStore.pendingSignup?.birthDate ?? '')

const errorMessage = ref(kakaoId ? '' : '잘못된 접근입니다. 카카오 로그인을 다시 시도해주세요.')

const canSubmit = computed(
  () => NICKNAME_PATTERN.test(nickname.value) && isValidBirthDate(birthDate.value),
)

function goToLogin() {
  router.replace({ name: 'login' })
}

function handleBirthDateInput(value) {
  birthDate.value = value.replace(/\D/g, '').slice(0, BIRTH_DATE_LENGTH)
}

function handleSubmit() {
  if (!canSubmit.value) return

  authStore.setPendingSignup({ nickname: nickname.value, birthDate: birthDate.value })
  router.push({ name: 'basic-info' })
}
</script>

<template>
  <div class="callback-signup-view">
    <AppHeader title="회원가입" :show-back="false" />
    <BaseBreadcrumb class="callback-signup-view__steps" :steps="ONBOARDING_STEPS" :current="1" />

    <template v-if="kakaoId">
      <div class="callback-signup-view__body">
        <div class="callback-signup-view__intro">
          <h2 class="callback-signup-view__title">
            반갑습니다!<br />
            추가 정보를 입력해주세요
          </h2>
          <p class="callback-signup-view__subtitle">회원가입 완료를 위해 필요한 정보예요</p>
        </div>

        <BaseInputField
          v-model="nickname"
          label="닉네임"
          required
          placeholder="2~12자 한글 · 영문 · 숫자"
          :max-length="NICKNAME_MAX_LENGTH"
          helper-text="서비스에서 표시되는 이름입니다"
        />

        <BaseInputField
          :model-value="birthDate"
          label="생년월일"
          required
          placeholder="예: 001215"
          :max-length="BIRTH_DATE_LENGTH"
          helper-text="YYMMDD 6자리로 입력해주세요"
          @update:model-value="handleBirthDateInput"
        />
      </div>

      <div class="callback-signup-view__footer">
        <BaseButton size="lg" :disabled="!canSubmit" @click="handleSubmit">다음</BaseButton>
      </div>
    </template>

    <div v-else class="callback-signup-view__footer">
      <p class="callback-signup-view__error">{{ errorMessage }}</p>
      <BaseButton size="lg" @click="goToLogin">로그인 화면으로 돌아가기</BaseButton>
    </div>
  </div>
</template>

<style scoped>
.callback-signup-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  padding: 16px 24px 24px;
}

.callback-signup-view__steps {
  align-self: center;
}

.callback-signup-view__body {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.callback-signup-view__intro {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.callback-signup-view__title {
  margin: 0;
  font-size: 20.6px;
  font-weight: 500;
  line-height: 1.44;
  letter-spacing: -0.4px;
  color: var(--color-text-primary);
}

.callback-signup-view__subtitle {
  margin: 0;
  font-size: 13.1px;
  color: var(--color-text-secondary);
}

.callback-signup-view__footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.callback-signup-view__error {
  margin: 0;
  font-size: 13px;
  color: #e03131;
  text-align: center;
}
</style>
