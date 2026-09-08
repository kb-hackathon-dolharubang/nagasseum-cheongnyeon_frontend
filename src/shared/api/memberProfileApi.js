import httpClient from '@/shared/api/httpClient'

// 마이페이지 프로필 수정(member)과 회원가입 온보딩의 월 소득·직업군 입력(auth)이
// 같은 엔드포인트를 공유한다.
export async function updateMyInfo({ nickname, incomeBracket, monthlyIncome, occupationType }) {
  await httpClient.patch('/api/v1/members/me', {
    nickname,
    incomeBracket,
    monthlyIncome,
    occupationType,
  })
}
