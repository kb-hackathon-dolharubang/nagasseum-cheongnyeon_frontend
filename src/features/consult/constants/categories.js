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
