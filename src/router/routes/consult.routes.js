import {
  ConsultView,
  ConsultReservationView,
  ConsultReservationInfoView,
  ConsultReservationCompleteView,
} from '@/features/consult'

export const consultRoutes = [
  { path: 'consult', name: 'consult', component: ConsultView },
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
]
