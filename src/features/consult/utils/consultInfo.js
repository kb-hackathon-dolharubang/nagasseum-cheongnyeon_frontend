import { recentDiagnosisGoal, generalConsultInfo } from '@/features/consult/data/counselors'

// 상담 예약 2단계('상담 정보')와 상담 리포트 화면이 "상담에 활용되는 정보"를 똑같은
// 방식으로 만든다 - AI가 새로 추론하는 값이 아니라 기존 두 원본 Mock(recentDiagnosisGoal/
// generalConsultInfo)에서 그대로 가져오는 값이라 로직을 한 곳에만 둔다.
export function buildConsultInfo(consultationType) {
  if (consultationType === 'GOAL_DIAGNOSIS') {
    return {
      housingPreference: { ...recentDiagnosisGoal.originalCondition },
      currentAsset: generalConsultInfo.currentAsset ?? null,
      monthlySaving: generalConsultInfo.monthlySaving ?? null,
      targetDate: recentDiagnosisGoal.targetDate ?? null,
      loanPreference: generalConsultInfo.loanPreference ?? null,
    }
  }

  return {
    housingPreference: generalConsultInfo.housingPreference
      ? { ...generalConsultInfo.housingPreference }
      : null,
    currentAsset: generalConsultInfo.currentAsset ?? null,
    monthlySaving: generalConsultInfo.monthlySaving ?? null,
    targetDate: generalConsultInfo.targetDate ?? null,
    loanPreference: generalConsultInfo.loanPreference ?? null,
  }
}
