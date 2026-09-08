import httpClient from '@/shared/api/httpClient'

// 자산 도메인(asset)과 홈 화면 대시보드(home)가 같은 엔드포인트를 공유한다.
export async function getAssetSummary() {
  const { data } = await httpClient.get('/api/v1/assets/summary')
  return data.data
}
