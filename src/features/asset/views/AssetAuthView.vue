<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'
import BaseCard from '@/shared/components/atoms/base/card/BaseCard.vue'
import BaseAlert from '@/shared/components/atoms/feedback/Alert/BaseAlert.vue'
import BaseToast from '@/shared/components/atoms/feedback/Toast/BaseToast.vue'
import BaseBreadcrumb from '@/shared/components/atoms/navigation/Breadcrumb/BaseBreadcrumb.vue'
import BaseInputField from '@/shared/components/molecules/BaseInputField.vue'
import AppHeader from '@/shared/components/molecules/AppHeader.vue'
import { ONBOARDING_STEPS } from '@/shared/constants/onboardingSteps'
import { loadAuthSession } from '@/shared/utils/authSession'
import { isValidBirthDate } from '@/shared/utils/validator'

import { useAssetStore } from '@/features/asset/store/assetStore'

const BIRTH_DATE_LENGTH = 6

const router = useRouter()
const assetStore = useAssetStore()

const savedBirthDate = loadAuthSession().user?.birthDate ?? ''

const bankId = ref('')
const password = ref('')
const birthDate = ref(savedBirthDate)
const isPasswordVisible = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const showSuccessToast = ref(false)
const successMessage = ref('')

const passwordFieldType = computed(() => (isPasswordVisible.value ? 'text' : 'password'))

const canSubmit = computed(
  () =>
    bankId.value.trim().length > 0 &&
    password.value.trim().length > 0 &&
    isValidBirthDate(birthDate.value) &&
    !isSubmitting.value,
)

function resetForm() {
  bankId.value = ''
  password.value = ''
  birthDate.value = savedBirthDate
  isPasswordVisible.value = false
}

async function handleSubmit() {
  if (!canSubmit.value) return

  isSubmitting.value = true
  errorMessage.value = ''

  const institutionName = assetStore.currentInstitution.name

  try {
    await assetStore.authenticateCurrentInstitution({
      id: bankId.value,
      password: password.value,
      birthDate: birthDate.value,
    })

    if (assetStore.currentInstitution) {
      successMessage.value = `${institutionName} 연동 완료`
      showSuccessToast.value = true
      resetForm()
    } else {
      router.push({ name: 'asset-syncing' })
    }
  } catch (error) {
    errorMessage.value =
      error.response?.data?.error?.message ??
      '인증에 실패했습니다. 입력한 정보를 다시 확인해주세요.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  if (!assetStore.currentInstitution) {
    router.replace({ name: 'asset-link' })
  }
})
</script>

<template>
  <div v-if="assetStore.currentInstitution" class="asset-auth-view asset-auth-view--animated">
    <AppHeader :title="`${assetStore.currentInstitution.name} 인증`" @back="router.back()" />
    <BaseBreadcrumb class="asset-auth-view__steps" :steps="ONBOARDING_STEPS" :current="3" />

    <div class="asset-auth-view__body">
      <div class="asset-auth-view__intro">
        <h2 class="asset-auth-view__title">인증 정보를 입력해주세요</h2>
        <p class="asset-auth-view__subtitle">CODEF를 통해 안전하게 암호화되어 전송됩니다</p>
      </div>

      <BaseInputField v-model="bankId" label="인터넷뱅킹 ID" required placeholder="아이디 입력" />

      <BaseInputField
        v-model="password"
        label="비밀번호"
        required
        :type="passwordFieldType"
        placeholder="비밀번호 입력"
      >
        <template #suffix>
          <button
            type="button"
            class="asset-auth-view__password-toggle"
            :aria-label="isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 보기'"
            @click="isPasswordVisible = !isPasswordVisible"
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.6" />
              <line
                v-if="!isPasswordVisible"
                x1="4"
                y1="20"
                x2="20"
                y2="4"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </template>
      </BaseInputField>

      <BaseInputField
        v-model="birthDate"
        label="생년월일"
        required
        placeholder="YYMMDD (예: 990101)"
        :max-length="BIRTH_DATE_LENGTH"
      />

      <BaseCard class="asset-auth-view__notice">
        <p class="asset-auth-view__notice-title">
          <svg class="asset-auth-view__notice-icon" viewBox="0 0 24 24" width="16" height="16">
            <rect
              x="5"
              y="11"
              width="14"
              height="10"
              rx="2"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
            />
            <path
              d="M8 11V7a4 4 0 0 1 8 0v4"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
          </svg>
          안전한 인증
        </p>
        <ul class="asset-auth-view__notice-list">
          <li>입력한 정보는 CODEF로만 전달됩니다</li>
          <li>서비스 서버에는 저장되지 않습니다</li>
          <li>인증 후 Connected ID만 보관합니다</li>
        </ul>
      </BaseCard>

      <p class="asset-auth-view__warning">
        비밀번호 오류 3회 이상 시 계정이 잠길 수 있어요<br />
        최근 정상 로그인한 정보로 입력해주세요
      </p>
    </div>

    <div class="asset-auth-view__footer">
      <BaseAlert v-if="errorMessage" variant="error">{{ errorMessage }}</BaseAlert>
      <BaseButton size="lg" :disabled="!canSubmit" @click="handleSubmit">
        {{ isSubmitting ? '인증 중...' : '연동하고 자산 조회하기' }}
      </BaseButton>
    </div>

    <BaseToast v-model="showSuccessToast" variant="success">{{ successMessage }}</BaseToast>
  </div>
</template>

<style scoped>
.asset-auth-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  padding: 16px 24px 24px;
}

.asset-auth-view__steps {
  align-self: center;
}

.asset-auth-view--animated > * {
  animation: card-rise 0.35s ease-out both;
}

.asset-auth-view--animated > *:nth-child(2) {
  animation-delay: 0.04s;
}

.asset-auth-view--animated > *:nth-child(3) {
  animation-delay: 0.08s;
}

.asset-auth-view--animated > *:nth-child(4) {
  animation-delay: 0.12s;
}

.asset-auth-view__body {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.asset-auth-view__intro {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.asset-auth-view__title {
  margin: 0;
  font-size: 15.9px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.asset-auth-view__subtitle {
  margin: 0;
  font-size: 13.1px;
  color: var(--color-text-secondary);
}

.asset-auth-view__password-toggle {
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  /* suffix 래퍼(.base-input-field__suffix)가 pointer-events: none이라 그대로 두면
     이 버튼도 상속받아 클릭이 막힌다 — 버튼만 다시 켜준다. */
  pointer-events: auto;
}

/* 보이는 아이콘 크기(18px)는 유지하고 터치 영역만 40px까지 넓힌다 */
.asset-auth-view__password-toggle::before {
  content: '';
  position: absolute;
  inset: -11px;
}

.asset-auth-view__notice {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.asset-auth-view__notice-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 13.2px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.asset-auth-view__notice-icon {
  flex-shrink: 0;
}

.asset-auth-view__notice-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 11.1px;
  color: var(--color-text-secondary);
}

.asset-auth-view__warning {
  margin: 0;
  text-align: center;
  font-size: 11.1px;
  line-height: 1.7;
  color: #6e756f;
}

.asset-auth-view__footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
</style>
