import httpClient from '@/shared/api/httpClient'
import { createManualAsset } from '@/shared/api/manualAssetApi'
import { updateMyInfo } from '@/shared/api/memberProfileApi'

export async function getKakaoCallback(code) {
  const { data } = await httpClient.get('/api/v1/oauth/kakao/callback', {
    params: { code },
  })
  return data.data
}

export async function signupWithKakao(signupInfo) {
  const { data } = await httpClient.post('/api/v1/oauth/kakao/signup', signupInfo)
  return data.data
}

export async function refreshAccessToken(refreshToken) {
  const { data } = await httpClient.post('/api/v1/auth/refresh', { refreshToken })
  return data.data
}

export async function logout() {
  await httpClient.post('/api/v1/auth/logout')
}

export async function createManualDepositAsset({ amount }) {
  return createManualAsset({ assetType: 'DEPOSIT', amount })
}

// 회원가입 온보딩(월 소득·직업군 선택 입력)은 마이페이지 프로필 수정과 같은 엔드포인트를 쓴다.
export async function updateSignupProfile({ monthlyIncome, occupationType }) {
  return updateMyInfo({ monthlyIncome, occupationType })
}
