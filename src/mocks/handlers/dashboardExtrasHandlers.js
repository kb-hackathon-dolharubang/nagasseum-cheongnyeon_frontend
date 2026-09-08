import { http, HttpResponse } from 'msw'

import { mockRecommendedPolicies } from '@/mocks/data/dashboardExtras'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// 정책 추천 전용 엔드포인트가 아직 확정되지 않아 임시로 만든 목업 핸들러(dashboardExtras.js 참고)
export const dashboardExtrasHandlers = [
  http.get(`${API_BASE_URL}/api/v1/policies/recommended`, () => {
    return HttpResponse.json(mockRecommendedPolicies)
  }),
]
