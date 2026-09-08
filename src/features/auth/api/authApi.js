import httpClient from '@/shared/api/httpClient'
import { createManualAsset } from '@/shared/api/manualAssetApi'

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
