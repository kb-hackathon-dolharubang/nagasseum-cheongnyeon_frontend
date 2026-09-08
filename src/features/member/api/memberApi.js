import httpClient from '@/shared/api/httpClient'
import { updateMyInfo } from '@/shared/api/memberProfileApi'

export { updateMyInfo }

export async function getMyProfile() {
  const { data } = await httpClient.get('/api/v1/members/me')
  return data.data
}

export async function updateAgreement(type, agreed) {
  await httpClient.patch(`/api/v1/members/me/agreements/${type}`, { agreed })
}
