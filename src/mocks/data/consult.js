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

// GET /api/v1/consultations/:reservationId/report 목 데이터. 예약/채팅/종료는 실제
// 톰캣 백엔드를 쓰지만, 리포트 생성 API는 아직 백엔드에 없어 어떤 reservationId로
// 요청해도 항상 이 완료된 리포트를 그대로 돌려준다 - 화면 확인용이라 reservationId별
// 분기는 두지 않는다.
export const mockConsultationReport = {
  status: 'COMPLETED',
  summary:
    '이번 상담에서는 현재 자산과 희망 주거 조건을 기준으로 목표 시점까지 저축 계획을 함께 점검했습니다. 지금 속도로는 목표 시점에 다소 못 미칠 수 있어 월 저축액 조정이 필요하다는 점을 확인했습니다.',
  mainConcerns: ['지금 저축 속도로 목표 시점을 맞출 수 있는지', '월 저축액을 얼마나 늘려야 하는지'],
  discussionPoints: [
    '현재 자산과 목표 필요 금액 비교',
    '희망 주거 조건의 예상 비용 확인',
    '목표 시점까지 남은 기간과 필요 저축액 계산',
    '정책 대출 활용 가능성 확인',
  ],
  result:
    '현재 조건을 유지하려면 월 저축액을 늘리거나 목표 시점을 조정하는 방향이 현실적이라는 결론을 확인했습니다.',
  recommendations: ['월 저축액 조정 검토', '목표 시점 조정 검토', '정책 대출 활용 가능 여부 확인'],
  nextActions: [
    {
      title: '월 저축 계획을 조정해보세요',
      description: '현재 저축액에서 상향 조정하는 방안을 검토해보세요.',
      actionType: 'SAVING',
    },
    {
      title: '목표 조건을 다시 확인해보세요',
      description: '상담 결과를 반영해 목표 시점이나 주거 조건을 수정할 수 있습니다.',
      actionType: 'GOAL',
    },
    {
      title: '대출 가능 여부를 확인해보세요',
      description: '현재 조건에서 활용 가능한 정책 대출이 있는지 확인해보세요.',
      actionType: 'LOAN',
    },
  ],
}

export function getMockConsultationReport() {
  return mockConsultationReport
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

// PATCH /api/v1/consultations/:reservationId/end 응답을 만들면서 GET(users/:userId)이
// 참조하는 mockUserConsultations의 status도 그대로 반영한다 - 종료 후 재조회해도 같은
// 상태를 보게 하기 위함이다.
export function endMockReservation(reservationId) {
  const reservation = mockUserConsultations.find(
    (item) => item.reservationId === Number(reservationId),
  )
  const endedAt = new Date().toISOString()

  if (reservation) {
    reservation.status = 'COMPLETED'
  }

  return {
    reservationId: Number(reservationId),
    status: 'COMPLETED',
    endedAt,
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
