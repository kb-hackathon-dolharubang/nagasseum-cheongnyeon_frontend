import httpClient from '@/shared/api/httpClient'
import { findRegionBySigunguCode } from '@/shared/constants/regions'

// 폼 내부 payload(regions 코드 배열, areaMin/Max, monthlySaving)를 백엔드 진단 API가 기대하는
// DTO(region 이름 객체, sizeMin/Max, monthlySavings)로 변환한다.
// housingType/dealType은 폼에서부터 이미 propertyType/tradeType enum 값으로 들어오므로 그대로 넘긴다.
function toDiagnosisRequest(payload) {
  const region = payload.region ? findRegionBySigunguCode(payload.region) : null

  return {
    region: region ? { sido: region.sidoName, sigungu: region.sigunguName } : null,
    propertyType: payload.housingType,
    tradeType: payload.dealType,
    sizeMin: payload.areaMin,
    sizeMax: payload.areaMax,
    depositMin: payload.depositMin,
    depositMax: payload.depositMax,
    monthlyRentMin: payload.monthlyRentMin,
    monthlyRentMax: payload.monthlyRentMax,
    monthlySavings: payload.monthlySaving,
    targetDate: payload.targetDate,
  }
}

// 희망 주거 조건 입력 -> 자산 기반 총예산 계산 -> 시세 위치/예산 부족 여부/조정 제안 반환
// 이 엔드포인트는 CLAUDE.md가 명시한 {success,data,error} 래퍼를 그대로 따르므로 여기서 언래핑한다.
// (다른 goal API의 언래핑 미구현 이슈와는 별개로, 이 응답 계약에 한해 대응)
// memberId는 인증 토큰(@LoginMember)에서 추출하므로 별도 전달 불필요
export async function postGoalDiagnosis(payload) {
  const { data } = await httpClient.post('/api/v1/goals/diagnosis', toDiagnosisRequest(payload))
  return data.data
}

// 값을 지정하지 않은 조건(null)은 쿼리 문자열에서 아예 뺀다.
// axios도 null/undefined 파라미터는 직렬화하지 않지만, "조건 없음 = 파라미터 없음"이라는 계약을
// 호출부가 아니라 여기서 명시적으로 보장한다. 빈 문자열도 조건 없음으로 취급한다
// (백엔드 @NotBlank/@Pattern 검증에 빈 값이 걸려 400이 나는 것을 막는다).
function toRecommendationParams(condition) {
  return Object.fromEntries(
    Object.entries(condition).filter(
      ([, value]) => value !== null && value !== undefined && value !== '',
    ),
  )
}

// 희망 조건을 받아 추천 목표 대안 목록을 돌려준다 (PREFERENCE / REALISTIC / VALUE / HOLD_OUT).
//
// 명세서의 GET + Query Parameter를 따른다.
// ⚠️ 백엔드 구현(GoalRecommendationController#recommend)은 아직 POST + @RequestBody라
// 그대로 붙이면 405가 난다. 백엔드도 @GetMapping + @ModelAttribute로 바꿔야 동작한다.
// (명세서에 "미확정 — 프론트와 합의 필요"로 남아 있던 항목을 명세서 기준으로 정리한 것)
//
// 쿼리 파라미터 이름은 백엔드 GoalRecommendationRequest 필드와 1:1로 같아 변환 없이 그대로 보낸다.
// regionCode(시도 2자리 또는 시군구 5자리)만 필수이고 나머지는 전부 선택값이며,
// 지정하지 않은 조건은 아예 쿼리에서 빼면 각 추천 알고리즘이 알아서 채운다.
// memberId는 인증 토큰(@LoginMember)에서 추출하므로 별도 전달 불필요
export async function fetchGoalRecommendations(condition) {
  const { data } = await httpClient.get('/api/v1/goals/recommendations', {
    params: toRecommendationParams(condition),
  })
  return data.data
}

// 진단 결과 화면(추천 계획 비교 리스트)용 추천 목록 조회.
// 조건 입력 단계(fetchGoalRecommendations)와 달리 조건 쿼리 없이 memberId(인증 토큰)만으로
// 이미 계산되어 있는 추천 결과를 그대로 돌려받는다 — 새로고침이나 직접 진입에도 store에만
// 의존하지 않고 항상 서버에서 다시 받아올 수 있게 하기 위함.
export async function fetchGoalRecommendation() {
  const { data } = await httpClient.get('/api/v1/goals/recommendation')
  return data.data
}

// 목표 상세 화면 데이터 (목표 정보 · 달성 현황 · 저축 현황 · 예상 달성 시점)
export async function fetchGoalDetail(goalId) {
  const { data } = await httpClient.get(`/api/v1/goals/${goalId}/detail`)
  return data.data
}

// 기존 목표 내용 조회. 상세 조회(detail)와 달리 수정 폼 재현에 필요한 원본 입력값
// (특히 지역 "코드" regionCode)을 평평한 GoalResponse로 내려주므로, 목표 수정 요청 본문을
// 만들 때 사용한다. 응답 필드 구성이 수정 요청 본문과 같아 그대로 되돌려 보낼 수 있다.
export async function fetchGoal(goalId) {
  const { data } = await httpClient.get(`/api/v1/goals/${goalId}`)
  return data.data
}

// 월 저축액을 특정 금액으로 바꿨다고 가정했을 때의 예상 달성 시점 (저장하지 않고 계산만 한다).
// 응답은 목표 달성 상세 조회의 forecasts[] 항목과 동일한 형태 { basis, monthlySaving, expectedDate, monthsDiff }
export async function fetchMonthlySavingSimulation(goalId, monthlySaving) {
  const { data } = await httpClient.get(`/api/v1/goals/${goalId}/simulations/monthly-saving`, {
    params: { monthlySaving },
  })
  return data.data
}

// 목표 수정. 부분 수정(PATCH)이 아니라 전체 교체(PUT)라 목표/주거 조건 전체를 함께 보내야 한다.
export async function putGoal(goalId, payload) {
  const { data } = await httpClient.put(`/api/v1/goals/${goalId}`, payload)
  return data.data
}

// 로그인 사용자의 활성 목표(status=ACTIVE) 조회. 활성 목표가 없어도 정상 상태(200)로
// data:null을 내려주도록 명세되어 있다 — 하단 탭바가 목표 탭 진입 시 상세/빈 화면을
// 가르는 데 사용한다.
export async function fetchActiveGoal() {
  const { data } = await httpClient.get('/api/v1/goals/active')
  return data.data
}

// 목표 삭제. memberId는 인증 토큰(@LoginMember)에서 추출하므로 별도 전달 불필요
export async function deleteGoal(goalId) {
  const { data } = await httpClient.delete(`/api/v1/goals/${goalId}`)
  return data.data
}

// 진단 결과 팝업에서 "이 목표로 설정" 선택 시 목표를 저장한다.
// payload는 호출부(DiagnosisView.vue)에서 진단 응답 필드로 이미 백엔드 DTO 모양으로 만들어서 넘긴다.
// memberId는 인증 토큰(@LoginMember)에서 추출하므로 별도 전달 불필요
export async function postGoal(payload) {
  const { data } = await httpClient.post('/api/v1/goals', payload)
  return data.data
}

// 홈 화면 매물 시세 변화 카드용 데이터. memberId는 인증 토큰(@LoginMember)에서 추출하므로 별도 전달 불필요
export async function fetchGoalMarketTrend() {
  const { data } = await httpClient.get('/api/v1/goals/market-trend')
  return data.data
}

// 홈 화면 목표 달성 요약 카드용 데이터. memberId는 인증 토큰에서 추출하므로 별도 전달 불필요
export async function fetchGoalSummary() {
  const { data } = await httpClient.get('/api/v1/goals/summary')
  return data.data
}
