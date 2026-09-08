import {
  ConsultView,
  ConsultReservationView,
  ConsultReservationInfoView,
  ConsultReservationCompleteView,
  ConsultMyView,
  ConsultChatView,
  ConsultReportView,
} from '@/features/consult'

export const consultRoutes = [
  { path: 'consult', name: 'consult', component: ConsultView },
  { path: 'consult/my', name: 'consult-my', component: ConsultMyView },
  // 정적 경로(complete)를 동적 :counselorId 라우트보다 먼저 등록해 'complete'가
  // counselorId로 잘못 매칭되지 않게 한다.
  {
    path: 'consult/reservation/complete',
    name: 'consult-reservation-complete',
    component: ConsultReservationCompleteView,
  },
  {
    path: 'consult/reservation/:counselorId',
    name: 'consult-reservation',
    component: ConsultReservationView,
    props: true,
  },
  {
    path: 'consult/reservation/:counselorId/info',
    name: 'consult-reservation-info',
    component: ConsultReservationInfoView,
    props: true,
  },
  // 채팅/리포트 화면 자체는 이번 범위 밖이라 placeholder만 연결한다. 내 상담 카드의
  // CTA가 실제로 이동할 수 있어야 해서 라우트는 미리 만들어둔다.
  {
    path: 'consult/chat/:reservationId',
    name: 'consult-chat',
    component: ConsultChatView,
    props: true,
  },
  {
    path: 'consult/report/:reservationId',
    name: 'consult-report',
    component: ConsultReportView,
    props: true,
  },
]
