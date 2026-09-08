// 내 상담 목록/채팅 화면이 모두 같은 상담 상태 코드·라벨·배지 색을 쓴다. 화면마다
// 각자 다시 정의하지 않도록 이 모듈 하나로 모은다. RESERVED/IN_PROGRESS/COMPLETED
// 3개만 쓴다 - 우리 서비스는 시간 선택 즉시 예약이 확정되는 정책이라 승인 대기 등의
// 상태가 없다.
// point 배지는 다른 화면에서도 이미 강조색으로 쓰는 색이라 '상담 중'에 그대로
// 재사용해 다른 상태보다 눈에 띄게 한다.
export const CONSULTATION_STATUS_META = {
  RESERVED: { label: '예약 완료', badgeVariant: 'mint' },
  IN_PROGRESS: { label: '상담 중', badgeVariant: 'point' },
  COMPLETED: { label: '상담 완료', badgeVariant: 'neutral' },
}
