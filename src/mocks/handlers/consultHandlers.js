import { http, HttpResponse } from 'msw'

import { getMockConsultationReport } from '@/mocks/data/consult'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// consult 도메인 중 예약 생성/채팅/목록 조회/상담 종료는 실제 톰캣 백엔드를 그대로
// 쓴다(아래 주석 처리된 핸들러들 참고). 리포트 생성 API만 아직 백엔드에 없어서 이
// 엔드포인트만 MSW mock으로 응답한다 - 실제 리포트 API가 생기면 이 핸들러를 지운다.
export const consultHandlers = [
  http.get(`${API_BASE_URL}/api/v1/consultations/:reservationId/report`, ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: getMockConsultationReport(params.reservationId),
      error: null,
    })
  }),
]

// import {
//   mockUserConsultations,
//   mockConsultationMessages,
//   createMockReservation,
//   appendMockMessage,
//   endMockReservation,
// } from '@/mocks/data/consult'

// export const disabledConsultHandlers = [
//   http.post(`${API_BASE_URL}/api/v1/consultations`, async ({ request }) => {
//     const payload = await request.json()
//     return HttpResponse.json({ success: true, data: createMockReservation(payload), error: null })
//   }),

//   http.get(`${API_BASE_URL}/api/v1/consultations/users/:userId`, () => {
//     return HttpResponse.json({ success: true, data: mockUserConsultations, error: null })
//   }),

//   http.get(`${API_BASE_URL}/api/v1/consultations/:reservationId/messages`, ({ params }) => {
//     const messages = mockConsultationMessages[params.reservationId] ?? []
//     return HttpResponse.json({ success: true, data: messages, error: null })
//   }),

//   http.post(
//     `${API_BASE_URL}/api/v1/consultations/:reservationId/messages`,
//     async ({ request, params }) => {
//       const payload = await request.json()
//       const message = appendMockMessage(params.reservationId, payload)
//       return HttpResponse.json({ success: true, data: message, error: null })
//     },
//   ),

//   http.patch(`${API_BASE_URL}/api/v1/consultations/:reservationId/end`, ({ params }) => {
//     return HttpResponse.json({
//       success: true,
//       data: endMockReservation(params.reservationId),
//       error: null,
//     })
//   }),
// ]
