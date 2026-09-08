import { ref } from 'vue'
import { defineStore } from 'pinia'

import { getMyProfile, updateAgreement, updateMyInfo } from '@/features/member/api/memberApi'

export const AGREEMENT_TYPE = {
  NOTIFICATION: 'notification',
  COMPARE_DATA: 'compare_data',
}

const AGREEMENT_FIELD_BY_TYPE = {
  [AGREEMENT_TYPE.NOTIFICATION]: 'notificationAgreed',
  [AGREEMENT_TYPE.COMPARE_DATA]: 'compareDataAgreed',
}

export const useMemberStore = defineStore('member', () => {
  const profile = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  async function fetchProfile() {
    isLoading.value = true
    error.value = null

    try {
      profile.value = await getMyProfile()
    } catch (e) {
      error.value = e
    } finally {
      isLoading.value = false
    }
  }

  async function toggleAgreement(type, agreed) {
    const field = AGREEMENT_FIELD_BY_TYPE[type]
    const previous = profile.value[field]
    profile.value[field] = agreed

    try {
      await updateAgreement(type, agreed)
    } catch (e) {
      profile.value[field] = previous
      error.value = e
    }
  }

  async function updateProfile({ nickname, incomeBracket, monthlyIncome, occupationType }) {
    isLoading.value = true
    error.value = null

    try {
      await updateMyInfo({ nickname, incomeBracket, monthlyIncome, occupationType })
      if (nickname != null) profile.value.nickname = nickname
      if (incomeBracket != null) profile.value.incomeBracket = incomeBracket
      if (monthlyIncome != null) profile.value.monthlyIncome = monthlyIncome
      if (occupationType != null) profile.value.occupationType = occupationType
    } catch (e) {
      error.value = e
    } finally {
      isLoading.value = false
    }
  }

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    toggleAgreement,
    updateProfile,
  }
})
