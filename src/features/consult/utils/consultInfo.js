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

/* ── 예약 생성 API(POST /api/v1/consultations) 요청 매핑 ──────────────────────
   화면(consultationData)은 province/district/neighborhood를 {code, name} 객체로
   다루지만, 백엔드 DTO는 이름 문자열만 받는다 - 필요한 필드만 변환해서 보낸다. */

function toHousingPreferenceRequest(housingPreference) {
  if (!housingPreference) return null
  return {
    province: housingPreference.province?.name ?? null,
    district: housingPreference.district?.name ?? null,
    neighborhood: housingPreference.neighborhood?.name ?? null,
    housingType: housingPreference.housingType ?? null,
    transactionType: housingPreference.transactionType ?? null,
    areaRange: housingPreference.areaRange
      ? {
          min: housingPreference.areaRange.min,
          max: housingPreference.areaRange.max,
          label: housingPreference.areaRange.label,
        }
      : null,
  }
}

// "2031.08" -> "2031-08". recentDiagnosisGoal은 '.'구분, generalConsultInfo는 이미
// '-'구분이라 formatYearMonthFlexibleKo와 같은 방식으로 둘 다 받아 표준화한다.
function toApiYearMonth(value) {
  if (!value) return null
  const [year, month] = String(value).split(/[-.]/)
  return `${year}-${String(month).padStart(2, '0')}`
}

// 예약 화면(ConsultReservationInfoView)의 consultationData -> 예약 생성 API의
// consultInfo 필드로 변환한다.
export function toConsultInfoRequest(consultationData) {
  return {
    housingPreference: toHousingPreferenceRequest(consultationData.housingPreference),
    currentAsset: consultationData.currentAsset ?? null,
    monthlySaving: consultationData.monthlySaving ?? null,
    targetDate: toApiYearMonth(consultationData.targetDate),
    loanPreference: consultationData.loanPreference ?? null,
  }
}

// GOAL_DIAGNOSIS 상담에서 함께 보내는 진단 결과 snapshot(recentDiagnosisGoal 재사용,
// 새 진단 API 호출 없음). 백엔드 diagnosis DTO의 정확한 필드명이 별도 명세로 주어지지
// 않아, 이 프로젝트가 이미 쓰는 필드명(originalCondition/recommendedCondition/
// targetDate/recommendedMonthlySaving)을 그대로 사용한다 - 실제 계약과 다르면 이
// 함수만 맞춰 고치면 된다.
export function toDiagnosisRequest(diagnosisGoal) {
  if (!diagnosisGoal) return null
  return {
    originalCondition: toHousingPreferenceRequest(diagnosisGoal.originalCondition),
    recommendedCondition: toHousingPreferenceRequest(diagnosisGoal.recommendedCondition),
    targetDate: toApiYearMonth(diagnosisGoal.targetDate),
    recommendedMonthlySaving: diagnosisGoal.recommendedMonthlySaving ?? null,
  }
}
