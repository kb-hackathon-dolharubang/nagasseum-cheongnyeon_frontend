import httpClient from '@/shared/api/httpClient'

// 목표 도메인(goal)과 홈 화면 대시보드(home)가 같은 엔드포인트를 공유한다.
export async function fetchGoalSummary() {
  const { data } = await httpClient.get('/api/v1/goals/summary')
  return data.data
}

export async function fetchGoalMarketTrend() {
  const { data } = await httpClient.get('/api/v1/goals/market-trend')
  return data.data
}
