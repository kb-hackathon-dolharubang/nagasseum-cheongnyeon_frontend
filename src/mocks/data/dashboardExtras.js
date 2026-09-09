// 정책 추천은 CLAUDE.md 스코프(목표 진단·관리) 밖이라 실제 API 계약이 아직 없다.
// 홈 화면 목업 요구사항을 채우기 위한 임시 목업이며, 실제 정책 담당자와 통합할 때
// 이 파일과 dashboardExtrasHandlers.js를 실제 엔드포인트로 교체해야 한다.

import { mockPolicySummaries } from '@/mocks/data/policy'

// 전세 목표를 세운 페르소나에게 실제로 도움이 되는 두 건. 별도 id 체계를 두지 않고
// 정책 목록(mockPolicySummaries)에서 골라 오므로, 카드에서 정책 상세로 그대로 이어진다.
const RECOMMENDED_POLICY_IDS = [1, 4]

export const mockRecommendedPolicies = RECOMMENDED_POLICY_IDS.map((id) => {
  const policy = mockPolicySummaries.find((item) => item.id === id)

  return {
    id: policy.id,
    policyName: policy.policyName,
    policySummary: policy.benefitDescription,
    applyPeriodType: policy.applyPeriodType,
    applyEndDate: policy.applyEndDate,
  }
})
