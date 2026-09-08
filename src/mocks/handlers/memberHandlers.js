import { http, HttpResponse } from 'msw'

import {
  mockMemberProfile,
  mockAgreementNotFoundResponse,
  mockMemberNotFoundResponse,
} from '@/mocks/data/member'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const AGREEMENT_FIELD_BY_TYPE = {
  notification: 'notificationAgreed',
  compare_data: 'compareDataAgreed',
}

// 목에서 존재하지 않는 회원(404) 흐름을 확인하려면 닉네임을 이 값으로 사용하세요.
const NOT_FOUND_TEST_NICKNAME = 'not-found'

export const memberHandlers = [
  http.get(`${API_BASE_URL}/api/v1/members/me`, () => {
    return HttpResponse.json({ success: true, data: mockMemberProfile, error: null })
  }),

  http.patch(`${API_BASE_URL}/api/v1/members/me/agreements/:type`, async ({ request, params }) => {
    const field = AGREEMENT_FIELD_BY_TYPE[params.type]
    if (!field) {
      return HttpResponse.json(mockAgreementNotFoundResponse, { status: 404 })
    }

    const { agreed } = await request.json()
    mockMemberProfile[field] = agreed

    return HttpResponse.json({ success: true, data: null, error: null })
  }),

  http.patch(`${API_BASE_URL}/api/v1/members/me`, async ({ request }) => {
    const { nickname, incomeBracket, monthlyIncome, occupationType } = await request.json()

    if (nickname === NOT_FOUND_TEST_NICKNAME) {
      return HttpResponse.json(mockMemberNotFoundResponse, { status: 404 })
    }

    if (nickname != null) mockMemberProfile.nickname = nickname
    if (incomeBracket != null) mockMemberProfile.incomeBracket = incomeBracket
    if (monthlyIncome != null) mockMemberProfile.monthlyIncome = monthlyIncome
    if (occupationType != null) mockMemberProfile.occupationType = occupationType

    return HttpResponse.json({ success: true, data: null, error: null })
  }),
]
