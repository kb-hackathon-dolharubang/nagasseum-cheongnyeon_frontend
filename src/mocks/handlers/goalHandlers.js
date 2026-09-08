import { http, HttpResponse, delay } from 'msw'

import {
  buildMockDiagnosisResult,
  buildMockRecommendations,
  buildMockRecommendationResult,
  mockGoalSaveResponse,
  mockGoalDetail,
  mockGoal,
  applyMockGoalUpdate,
  mockSavingSimulations,
  mockGoalMarketTrend,
  mockGoalSummaryHome,
  mockActiveGoal,
} from '@/mocks/data/goal'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// 쿼리 문자열은 값이 전부 문자열이라, 백엔드가 Integer/Long으로 받는 필드는 숫자로 되돌린다.
// (목 데이터 계산이 문자열 연결로 새는 것을 막는다) 없는 파라미터는 "조건 없음"이므로 null이다.
const NUMERIC_PARAMS = [
  'sizeMin',
  'sizeMax',
  'depositMin',
  'depositMax',
  'monthlyRentMin',
  'monthlyRentMax',
]

function toRecommendationCondition(searchParams) {
  const condition = Object.fromEntries(searchParams)

  for (const key of NUMERIC_PARAMS) {
    condition[key] = condition[key] === undefined ? null : Number(condition[key])
  }

  return condition
}

export const goalHandlers = [
  http.post(`${API_BASE_URL}/api/v1/goals/diagnosis`, async ({ request }) => {
    const payload = await request.json()
    return HttpResponse.json({
      success: true,
      data: buildMockDiagnosisResult(payload),
      error: null,
    })
  }),

  // 목표 추천 리스트 조회 (명세서대로 GET + Query Parameter).
  // 주의: 아래 `GET /goals/:goalId`가 세그먼트 하나짜리 경로를 모두 goalId로 매칭하므로,
  // `market-trend`/`summary`와 마찬가지로 반드시 그보다 먼저 등록해야 한다.
  // (MSW는 먼저 등록된 핸들러가 이긴다)
  http.get(`${API_BASE_URL}/api/v1/goals/recommendations`, async ({ request }) => {
    const condition = toRecommendationCondition(new URL(request.url).searchParams)

    // 백엔드가 @NotBlank로 막는 유일한 필수 조건. 화면에서 걸러지지만, 요청을 직접 만들었을 때의
    // 응답 형태도 목에서 그대로 확인할 수 있게 같이 재현한다.
    if (!condition.regionCode) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: { code: 'GOAL_INVALID_INPUT', message: '지역 코드는 필수입니다.' },
        },
        { status: 400 },
      )
    }

    // 실제로는 알고리즘 4개가 각각 실거래를 훑어서 수 초가 걸린다. 목이 즉시 응답하면
    // 로딩 화면이 한 프레임도 안 보여 확인할 수가 없어, 대략의 체감 시간을 흉내낸다.
    await delay(1500)

    return HttpResponse.json({
      success: true,
      data: buildMockRecommendations(condition),
      error: null,
    })
  }),

  // 진단 결과 화면(추천 계획 비교 리스트) 전용 조회. 조건 쿼리 없이 memberId(인증 토큰)만으로
  // 이미 계산된 추천 결과를 돌려받는다.
  // 주의: 아래 `GET /goals/:goalId`가 세그먼트 하나짜리 경로를 모두 goalId로 매칭하므로,
  // `market-trend`/`summary`와 마찬가지로 반드시 그보다 먼저 등록해야 한다.
  http.get(`${API_BASE_URL}/api/v1/goals/recommendation`, async () => {
    await delay(300)

    return HttpResponse.json({
      success: true,
      data: buildMockRecommendationResult(),
      error: null,
    })
  }),

  http.post(`${API_BASE_URL}/api/v1/goals`, async ({ request }) => {
    await request.json()
    return HttpResponse.json({ success: true, data: mockGoalSaveResponse, error: null })
  }),

  http.get(`${API_BASE_URL}/api/v1/goals/:goalId/simulations/monthly-saving`, ({ request }) => {
    const monthlySaving = Number(new URL(request.url).searchParams.get('monthlySaving'))

    if (!Number.isFinite(monthlySaving) || monthlySaving <= 0) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          message: null,
          error: { code: 'GOAL_INVALID_INPUT', message: '월 저축액은 0보다 커야 합니다.' },
        },
        { status: 400 },
      )
    }

    const simulation = mockSavingSimulations[monthlySaving]

    // 목 데이터가 없는 금액. 실제 API가 붙으면 임의 금액도 모두 계산되므로 이 분기는 사라진다.
    if (!simulation) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          message: null,
          error: {
            code: 'SIMULATION_MOCK_NOT_FOUND',
            message: `목 데이터가 준비된 금액이 아닙니다. (준비된 금액: ${Object.keys(mockSavingSimulations).join(', ')})`,
          },
        },
        { status: 404 },
      )
    }

    return HttpResponse.json({
      success: true,
      data: simulation,
      message: '월 저축액 변경 시 예상 달성 시점 조회 성공',
      error: null,
    })
  }),

  // 하단 탭바가 목표 탭 진입 시 상세/빈 화면을 가르는 데 쓴다. 아래 `/goals/:goalId`가
  // `active`도 goalId로 매칭해버리므로 반드시 그보다 먼저 등록해야 한다.
  http.get(`${API_BASE_URL}/api/v1/goals/active`, () => {
    return HttpResponse.json({ success: true, data: mockActiveGoal, error: null })
  }),

  // 홈 화면 매물 시세 변화 카드. 아래 `/goals/:goalId`가 `market-trend`도 goalId로 매칭해버리므로
  // 반드시 그보다 먼저 등록해야 한다(MSW는 먼저 등록된 핸들러가 이긴다).
  http.get(`${API_BASE_URL}/api/v1/goals/market-trend`, () => {
    return HttpResponse.json({ success: true, data: mockGoalMarketTrend, error: null })
  }),

  // 홈 화면 목표 달성 요약 카드. 마찬가지로 `/goals/:goalId`보다 먼저 등록해야 한다.
  http.get(`${API_BASE_URL}/api/v1/goals/summary`, () => {
    return HttpResponse.json({ success: true, data: mockGoalSummaryHome, error: null })
  }),

  // 주의: 아래 `/goals/:goalId`는 세그먼트 하나짜리 경로는 모두 goalId로 매칭하므로,
  // `market-trend`/`summary`처럼 고정 경로를 쓰는 핸들러는 항상 이보다 먼저 등록해야 한다.
  http.get(`${API_BASE_URL}/api/v1/goals/:goalId`, ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: { ...mockGoal, goalId: Number(params.goalId) },
      message: '목표 조회 성공',
      error: null,
    })
  }),

  http.put(`${API_BASE_URL}/api/v1/goals/:goalId`, async ({ request, params }) => {
    const payload = await request.json()
    applyMockGoalUpdate(payload)

    return HttpResponse.json({
      success: true,
      data: { goalId: Number(params.goalId), updatedAt: new Date().toISOString() },
      message: '목표 수정 성공',
      error: null,
    })
  }),

  http.get(`${API_BASE_URL}/api/v1/goals/:goalId/detail`, ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: { ...mockGoalDetail, goalId: Number(params.goalId) },
      error: null,
    })
  }),

  http.delete(`${API_BASE_URL}/api/v1/goals/:goalId`, ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: { goalId: Number(params.goalId) },
      message: '목표 삭제 성공',
      error: null,
    })
  }),
]
