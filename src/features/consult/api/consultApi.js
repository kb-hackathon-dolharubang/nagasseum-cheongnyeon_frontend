import httpClient from '@/shared/api/httpClient'

// 응답: { success: true, data: { reservationId, status, reservationDate,
// reservationTime }, error: null } - 다른 API 함수들과 같은 방식으로 data.data만
// 꺼내 돌려준다.
export async function createConsultationReservation(payload) {
  const { data } = await httpClient.post('/api/v1/consultations', payload)
  return data.data
}

// 내 상담(/consult/my) 목록 조회. 응답 data는 예약 배열이다 - 상담사 이름/프로필 같은
// 표시용 정보는 이 API에 없어 화면에서 기존 counselors Mock과 counselorId로 join한다.
export async function getUserConsultations(userId) {
  const { data } = await httpClient.get(`/api/v1/consultations/users/${userId}`)
  return data.data
}

// 채팅 화면(/consult/chat/:reservationId) 메시지 조회. 응답 data는 createdAt 오름차순
// 메시지 배열이다. 최초 진입 시 한 번, 이후 polling으로 반복 호출된다.
export async function getConsultationMessages(reservationId) {
  const { data } = await httpClient.get(`/api/v1/consultations/${reservationId}/messages`)
  return data.data
}

// 채팅 메시지 전송. payload: { senderType, content }. 성공하면 백엔드가 저장한 메시지
// (messageId 포함)를 그대로 돌려준다 - 화면에서 임시 id를 만들지 않고 이 응답을 쓴다.
export async function sendConsultationMessage(reservationId, payload) {
  const { data } = await httpClient.post(`/api/v1/consultations/${reservationId}/messages`, payload)
  return data.data
}
