import { ConsultView, ConsultReservationView, ConsultReservationInfoView } from '@/features/consult'

export const consultRoutes = [
  { path: 'consult', name: 'consult', component: ConsultView },
  {
    path: 'consult/reservation/:counselorId',
    name: 'consult-reservation',
    component: ConsultReservationView,
    props: true,
  },
  // 상담 정보 입력(2단계)은 아직 없어 counselorId만 받는 placeholder로 연결해둔다.
  // 날짜·시간은 이전 화면이 router state로 넘겨준다(URL에는 남기지 않는다).
  {
    path: 'consult/reservation/:counselorId/info',
    name: 'consult-reservation-info',
    component: ConsultReservationInfoView,
    props: true,
  },
]
