import httpClient from '@/shared/api/httpClient'

// 수동 자산 등록: CODEF로 연동할 수 없는 자산을 직접 등록.
// 온보딩(auth)의 보증금 입력과 자산 관리(asset) 도메인이 같은 엔드포인트를 공유한다.
export async function createManualAsset({ assetType, amount }) {
  const { data } = await httpClient.post('/api/v1/assets/manual', { assetType, amount })
  return data.data
}
