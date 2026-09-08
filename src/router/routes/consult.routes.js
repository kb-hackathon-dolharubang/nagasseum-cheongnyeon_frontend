import { ConsultView, ConsultReservationView } from '@/features/consult'

export const consultRoutes = [
  { path: 'consult', name: 'consult', component: ConsultView },
  // 예약 화면은 아직 없어 counselorId만 받는 placeholder로 연결해둔다.
  {
    path: 'consult/reservation/:counselorId',
    name: 'consult-reservation',
    component: ConsultReservationView,
    props: true,
  },
]
