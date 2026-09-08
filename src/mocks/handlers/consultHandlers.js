import { http, HttpResponse } from 'msw'

import {
  mockUserConsultations,
  mockConsultationMessages,
  createMockReservation,
  appendMockMessage,
} from '@/mocks/data/consult'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const consultHandlers = [
  http.post(`${API_BASE_URL}/api/v1/consultations`, async ({ request }) => {
    const payload = await request.json()
    return HttpResponse.json({ success: true, data: createMockReservation(payload), error: null })
  }),

  http.get(`${API_BASE_URL}/api/v1/consultations/users/:userId`, () => {
    return HttpResponse.json({ success: true, data: mockUserConsultations, error: null })
  }),

  http.get(`${API_BASE_URL}/api/v1/consultations/:reservationId/messages`, ({ params }) => {
    const messages = mockConsultationMessages[params.reservationId] ?? []
    return HttpResponse.json({ success: true, data: messages, error: null })
  }),

  http.post(
    `${API_BASE_URL}/api/v1/consultations/:reservationId/messages`,
    async ({ request, params }) => {
      const payload = await request.json()
      const message = appendMockMessage(params.reservationId, payload)
      return HttpResponse.json({ success: true, data: message, error: null })
    },
  ),
]
