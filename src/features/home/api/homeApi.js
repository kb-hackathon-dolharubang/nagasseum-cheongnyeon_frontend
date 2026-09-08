// 홈 대시보드는 goal/asset 도메인의 파일을 직접 참조하지 않고, 두 도메인과 함께
// shared/api에 공유해둔 엔드포인트를 이 파일을 통해서만 가져다 쓴다.
export { fetchGoalSummary, fetchGoalMarketTrend } from '@/shared/api/goalSummaryApi'
export { getAssetSummary } from '@/shared/api/assetSummaryApi'
