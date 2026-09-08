import { http, HttpResponse } from 'msw'

import {
  mockKakaoSignupRequiredResponse,
  mockKakaoLoginResponse,
  mockKakaoSignupResponse,
  mockRefreshResponse,
  mockRefreshInvalidResponse,
  mockLogoutResponse,
} from '@/mocks/data/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// 목에서 기존회원(로그인) 흐름을 확인하려면 카카오 로그인 code 파라미터에 이 값을 사용하세요.
const EXISTING_MEMBER_TEST_CODE = 'existing-member'

// 목에서 refreshToken 만료/위조 흐름을 확인하려면 이 값을 refreshToken으로 사용하세요.
const INVALID_REFRESH_TOKEN = 'invalid-refresh-token'

export const authHandlers = [
  http.get(`${API_BASE_URL}/api/v1/oauth/kakao/callback`, ({ request }) => {
    const code = new URL(request.url).searchParams.get('code')
    const response =
      code === EXISTING_MEMBER_TEST_CODE ? mockKakaoLoginResponse : mockKakaoSignupRequiredResponse
    return HttpResponse.json(response)
  }),
  http.post(`${API_BASE_URL}/api/v1/oauth/kakao/signup`, () => {
    return HttpResponse.json(mockKakaoSignupResponse)
  }),
  http.post(`${API_BASE_URL}/api/v1/auth/refresh`, async ({ request }) => {
    const { refreshToken } = await request.json()
    if (refreshToken === INVALID_REFRESH_TOKEN) {
      return HttpResponse.json(mockRefreshInvalidResponse, { status: 401 })
    }
    return HttpResponse.json(mockRefreshResponse)
  }),
  http.post(`${API_BASE_URL}/api/v1/auth/logout`, () => {
    return HttpResponse.json(mockLogoutResponse)
  }),
]
