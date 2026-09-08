import httpClient from '@/shared/api/httpClient'

// null/undefined/빈 문자열은 쿼리에서 제외한다 (백엔드 @NotBlank 검증 400 방지)
function toRecommendationParams(condition) {
  return Object.fromEntries(
    Object.entries(condition).filter(
      ([, value]) => value !== null && value !== undefined && value !== '',
    ),
  )
}

// 조건 입력 단계에서 추천 목표 대안 목록을 조회한다 (PREFERENCE / REALISTIC / VALUE / HOLD_OUT)
// regionCode만 필수이고, 지정하지 않은 조건은 쿼리에서 빠져 각 알고리즘이 알아서 채운다
export async function fetchGoalRecommendations(condition) {
  const { data } = await httpClient.get('/api/v1/goals/recommendations', {
    params: toRecommendationParams(condition),
  })
  return data.data
}

// 진단 결과 화면용 — 조건 없이 이미 계산된 추천 결과를 그대로 조회한다
export async function fetchGoalRecommendation() {
  const { data } = await httpClient.get('/api/v1/goals/recommendation')
  return data.data
}

// 목표 상세 화면 데이터 (목표 정보 · 달성 현황 · 저축 현황 · 예상 달성 시점)
export async function fetchGoalDetail(goalId) {
  const { data } = await httpClient.get(`/api/v1/goals/${goalId}/detail`)
  return data.data
}

// 목표 수정 폼 초기값용 — detail과 달리 regionCode 등 원본 입력값을 그대로 내려준다
export async function fetchGoal(goalId) {
  const { data } = await httpClient.get(`/api/v1/goals/${goalId}`)
  return data.data
}

// 월 저축액을 바꿨을 때의 예상 달성 시점만 계산한다 (저장하지 않음)
export async function fetchMonthlySavingSimulation(goalId, monthlySaving) {
  const { data } = await httpClient.get(`/api/v1/goals/${goalId}/simulations/monthly-saving`, {
    params: { monthlySaving },
  })
  return data.data
}

// 부분 수정이 아닌 전체 교체(PUT)라 목표/주거 조건 전체를 함께 보내야 한다
export async function putGoal(goalId, payload) {
  const { data } = await httpClient.put(`/api/v1/goals/${goalId}`, payload)
  return data.data
}

// 활성 목표가 없어도 data:null로 정상 응답(200)한다
export async function fetchActiveGoal() {
  const { data } = await httpClient.get('/api/v1/goals/active')
  return data.data
}

export async function deleteGoal(goalId) {
  const { data } = await httpClient.delete(`/api/v1/goals/${goalId}`)
  return data.data
}

export async function postGoal(payload) {
  const { data } = await httpClient.post('/api/v1/goals', payload)
  return data.data
}

// 홈 화면 매물 시세 변화 카드용 데이터
export async function fetchGoalMarketTrend() {
  const { data } = await httpClient.get('/api/v1/goals/market-trend')
  return data.data
}

// 홈 화면 목표 달성 요약 카드용 데이터
export async function fetchGoalSummary() {
  const { data } = await httpClient.get('/api/v1/goals/summary')
  return data.data
}
