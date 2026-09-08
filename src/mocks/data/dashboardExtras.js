// 정책 추천은 CLAUDE.md 스코프(목표 진단·관리) 밖이라 실제 API 계약이 아직 없다.
// 홈 화면 목업 요구사항을 채우기 위한 임시 목업이며, 실제 정책 담당자와 통합할 때
// 이 파일과 dashboardExtrasHandlers.js를 실제 엔드포인트로 교체해야 한다.

export const mockRecommendedPolicies = [
  {
    id: 101,
    policyName: '청년 월세 특별지원',
    policySummary: '최대 20만원 · 만 19-34세 1인가구',
    applyPeriodType: '기간',
    applyEndDate: '2026-08-16',
  },
  {
    id: 102,
    policyName: '중소기업 취업청년 전월세보증금 대출',
    policySummary: '최대 1억 · 연 1.2%',
    applyPeriodType: '상시',
    applyEndDate: null,
  },
]
