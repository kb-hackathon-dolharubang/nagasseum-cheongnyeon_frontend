// GET /api/v1/consultations/users/:userId 목 데이터. features/consult/data/counselors.js의
// myConsultations와 같은 3건을 그대로 써서, 화면의 counselorId join과 채팅/리포트 목데이터
// (reservationId 1/2/3)가 계속 같은 예약을 가리키도록 맞춘다.
export const mockUserConsultations = [
  {
    reservationId: 1,
    counselorId: 1,
    category: 'HOUSING',
    consultationType: 'GOAL_DIAGNOSIS',
    reservationDate: '2026-09-09',
    reservationTime: '14:00:00',
    status: 'RESERVED',
  },
  {
    reservationId: 2,
    counselorId: 2,
    category: 'SAVING',
    consultationType: 'GENERAL',
    reservationDate: '2026-09-06',
    reservationTime: '16:00:00',
    status: 'IN_PROGRESS',
  },
  {
    reservationId: 3,
    counselorId: 3,
    category: 'ASSET_MANAGEMENT',
    consultationType: 'GENERAL',
    reservationDate: '2026-09-05',
    reservationTime: '13:00:00',
    status: 'COMPLETED',
  },
]

// GET /api/v1/consultations/:reservationId/messages 목 데이터. key는 reservationId.
// POST로 보낸 메시지는 appendMockMessage가 여기에 그대로 추가해서, 폴링 중인 GET이
// 새 메시지를 이어서 돌려주게 한다.
export const mockConsultationMessages = {
  1: [
    {
      messageId: 1,
      senderType: 'COUNSELOR',
      content: '안녕하세요. 예약해주신 주거 상담을 맡은 김민지 상담사입니다. 편하게 말씀해주세요.',
      createdAt: '2026-09-09T14:00:00',
    },
  ],
  2: [
    {
      messageId: 1,
      senderType: 'COUNSELOR',
      content: '안녕하세요. 오늘 상담을 맡은 이서현 상담사입니다.',
      createdAt: '2026-09-06T16:00:00',
    },
    {
      messageId: 2,
      senderType: 'USER',
      content: '안녕하세요. 저축 계획을 조금 더 구체적으로 세우고 싶어서 상담 신청했습니다.',
      createdAt: '2026-09-06T16:01:00',
    },
    {
      messageId: 3,
      senderType: 'COUNSELOR',
      content: '네, 먼저 현재 월 저축액과 목표 시점부터 같이 확인해볼게요.',
      createdAt: '2026-09-06T16:02:00',
    },
  ],
  3: [
    {
      messageId: 1,
      senderType: 'COUNSELOR',
      content: '안녕하세요. 자산 관리 상담을 맡은 박지훈 상담사입니다.',
      createdAt: '2026-09-05T13:00:00',
    },
    {
      messageId: 2,
      senderType: 'USER',
      content: '네, 현재 자산 배분을 어떻게 조정하면 좋을지 궁금합니다.',
      createdAt: '2026-09-05T13:02:00',
    },
    {
      messageId: 3,
      senderType: 'COUNSELOR',
      content: '오늘 말씀드린 내용 정리해서 리포트로 보내드릴게요. 상담은 여기서 마무리하겠습니다.',
      createdAt: '2026-09-05T13:05:00',
    },
  ],
}

let nextReservationId = 100

// POST /api/v1/consultations 응답을 만든다. 실제 백엔드처럼 승인 절차 없이 바로
// RESERVED로 확정된 예약을 돌려준다.
export function createMockReservation(payload) {
  return {
    reservationId: nextReservationId++,
    status: 'RESERVED',
    reservationDate: payload.reservationDate,
    reservationTime: `${payload.reservationTime}:00`,
  }
}

// POST /api/v1/consultations/:reservationId/messages 응답을 만들면서 GET이 참조하는
// 배열에도 그대로 반영한다 - 화면이 임시 id 없이 이 응답만 쓰므로 messageId를 여기서 채번한다.
export function appendMockMessage(reservationId, payload) {
  if (!mockConsultationMessages[reservationId]) {
    mockConsultationMessages[reservationId] = []
  }

  const list = mockConsultationMessages[reservationId]
  const message = {
    messageId: (list.at(-1)?.messageId ?? 0) + 1,
    senderType: payload.senderType,
    content: payload.content,
    createdAt: new Date().toISOString(),
  }
  list.push(message)

  return message
}
