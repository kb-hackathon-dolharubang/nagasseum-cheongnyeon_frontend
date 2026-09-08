import httpClient from '@/shared/api/httpClient'

export async function getMyProfile() {
  const { data } = await httpClient.get('/api/v1/members/me')
  return data.data
}

export async function updateAgreement(type, agreed) {
  await httpClient.patch(`/api/v1/members/me/agreements/${type}`, { agreed })
}

export async function updateMyInfo({ nickname, incomeBracket, monthlyIncome, occupationType }) {
  await httpClient.patch('/api/v1/members/me', {
    nickname,
    incomeBracket,
    monthlyIncome,
    occupationType,
  })
}
