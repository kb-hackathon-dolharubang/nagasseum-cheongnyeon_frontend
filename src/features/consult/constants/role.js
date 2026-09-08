// 아직 로그인 사용자의 역할(회원/상담사)을 구분하는 인증 체계가 없어, 채팅 화면을
// 어느 쪽 시점으로 볼지 결정하는 Mock 값이다. 사용자 쪽 흐름(내 상담 → 상담 입장)은
// 이 기본값을 그대로 쓰고, 상담사 홈(/counselor)에서 들어온 채팅은 router state로
// 'COUNSELOR'를 넘겨 같은 화면을 그 시점으로 렌더링한다(ConsultChatView 참고).
export const CURRENT_ROLE = 'USER'

// 상담사 홈(/counselor)에서 "로그인한 상담사"로 가정하는 Mock 값. 별도 상담사 인증이
// 없어 counselors 배열에 이미 있는 상담사(이서현, id=2) 하나를 그대로 현재 사용자로 둔다.
export const CURRENT_COUNSELOR_ID = 2
