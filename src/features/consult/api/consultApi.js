import httpClient from '@/shared/api/httpClient'

// 응답: { success: true, data: { reservationId, status, reservationDate,
// reservationTime }, error: null } - 다른 API 함수들과 같은 방식으로 data.data만
// 꺼내 돌려준다.
export async function createConsultationReservation(payload) {
  const { data } = await httpClient.post('/api/v1/consultations', payload)
  return data.data
}
