// 상담 홈/예약 정보/예약 완료/내 상담 화면이 모두 같은 상담 분야 코드·라벨을 쓴다.
// 화면마다 각자 다시 정의하지 않도록 이 모듈 하나로 모은다.
export const CATEGORY_OPTIONS = [
  { label: '목표 설정', value: 'GOAL_SETTING' },
  { label: '저축', value: 'SAVING' },
  { label: '주거', value: 'HOUSING' },
  { label: '대출', value: 'LOAN' },
  { label: '자산 관리', value: 'ASSET_MANAGEMENT' },
]

export const CATEGORY_LABELS = Object.fromEntries(
  CATEGORY_OPTIONS.map((option) => [option.value, option.label]),
)

// "HOUSING" -> "주거 상담"처럼 화면에 보여줄 상담 주제 문구로 바꾼다.
export function getCategorySubjectLabel(category) {
  const label = CATEGORY_LABELS[category]
  return label ? `${label} 상담` : '상담'
}

// 예약 생성 API(POST /api/v1/consultations)가 쓰는 category 값은 프론트 내부 코드와
// 이름이 다르다(GOAL_SETTING -> GOAL, ASSET_MANAGEMENT -> ASSET, 나머지는 동일). 화면
// 로직은 항상 위 CATEGORY_OPTIONS의 value를 그대로 쓰고, 이 매핑은 그 API 요청을 만들
// 때만(consultApi 호출 직전) 사용한다.
export const CATEGORY_API_VALUES = {
  GOAL_SETTING: 'GOAL',
  SAVING: 'SAVING',
  HOUSING: 'HOUSING',
  LOAN: 'LOAN',
  ASSET_MANAGEMENT: 'ASSET',
}

// 위 매핑의 반대 방향(백엔드 값 -> 프론트 내부 코드). 내 상담 목록 조회처럼 API 응답의
// category를 화면에 표시할 때(getCategorySubjectLabel 등) 쓴다. CATEGORY_API_VALUES를
// 뒤집어서 만들어 두 매핑이 항상 같은 짝을 유지하게 한다.
export const CATEGORY_FROM_API_VALUES = Object.fromEntries(
  Object.entries(CATEGORY_API_VALUES).map(([internalValue, apiValue]) => [apiValue, internalValue]),
)
