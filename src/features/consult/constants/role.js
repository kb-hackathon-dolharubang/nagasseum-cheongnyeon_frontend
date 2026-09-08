// 아직 로그인 사용자의 역할(회원/상담사)을 구분하는 인증 체계가 없어, 채팅 화면을
// 어느 쪽 시점으로 볼지 결정하는 Mock 값이다. 상담사 쪽 화면을 확인하려면 이 값만
// 'COUNSELOR'로 바꾸면 같은 ChatView를 그대로 재사용해 확인할 수 있다.
export const CURRENT_ROLE = 'USER'
