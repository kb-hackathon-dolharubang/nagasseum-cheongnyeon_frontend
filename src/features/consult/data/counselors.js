// 상담사 조회 API가 아직 없어 Mock 데이터를 그대로 화면에서 import해서 쓴다.
// API가 생기면 이 배열 대신 consultApi 응답을 쓰도록 ConsultView만 바꾸면 된다.
// categories는 상담 홈의 분야 칩(ConsultView CATEGORY_OPTIONS) 라벨과 같은 문자열을 써서
// 칩 선택 상태로 바로 필터링할 수 있게 한다.
export const counselors = [
  {
    id: 1,
    name: '김민지',
    title: '자산관리 전문가',
    career: '금융 상담 경력 5년',
    rating: 4.9,
    consultationCount: 128,
    categories: ['목표 설정', '저축', '주거'],
    earliestAvailable: '9월 9일 14:00',
    image: '',
  },
  {
    id: 2,
    name: '이서현',
    title: '주거·대출 전문가',
    career: '금융 상담 경력 4년',
    rating: 4.8,
    consultationCount: 96,
    categories: ['주거', '대출', '자산 관리'],
    earliestAvailable: '9월 9일 16:00',
    image: '',
  },
  {
    id: 3,
    name: '박지훈',
    title: '자산관리 상담가',
    career: '자산관리 상담 경력 6년',
    rating: 4.7,
    consultationCount: 84,
    categories: ['자산 관리', '저축'],
    earliestAvailable: '9월 10일 10:00',
    image: '',
  },
]

// 최근 진단한 주거 목표 요약. 목표 상세 조회 API가 아직 없어 상담 홈/상담 정보 화면에서
// 보여줄 정보를 Mock으로 둔다. API가 생기면 goalStore 등에서 가져오도록 바꾸면 된다.
// region/transactionType/targetDate는 상담 홈의 요약 카드가, originalCondition 이하는
// 목표 진단 연계 상담 정보 화면(ConsultReservationInfoView)이 쓴다.
// originalCondition/recommendedCondition은 HousingPreferenceSelect가 다루는 것과 같은
// shape(province/district/neighborhood/housingType/transactionType/areaRange)을 쓴다 -
// originalCondition은 상담 정보 Bottom Sheet에서 그대로 수정할 수 있어야 하기 때문이다.
export const recentDiagnosisGoal = {
  id: 1,
  region: '서울 마포구',
  transactionType: '전세',
  targetDate: '2031.08',
  originalCondition: {
    province: { code: '11', name: '서울특별시' },
    district: { code: '11440', name: '마포구' },
    neighborhood: { code: '11440-SEOGYO', name: '서교동' },
    housingType: 'OFFICETEL',
    transactionType: 'JEONSE',
    areaRange: { min: 10, max: 20, label: '10~20평' },
  },
  recommendedCondition: {
    province: { code: '11', name: '서울특별시' },
    district: { code: '11440', name: '마포구' },
    neighborhood: { code: '11440-SEOGYO', name: '서교동' },
    housingType: 'DETACHED',
    transactionType: 'JEONSE',
    areaRange: { min: 4, max: 9, label: '4~9평' },
  },
  recommendedMonthlySaving: 1100000,
}

// 일반 상담(GENERAL)에서 상담사가 참고할 사용자 정보. 어떤 분야(category)를 골랐는지와
// 무관하게 항상 같은 4개 필수 항목(희망 주거 조건/현재 자산/월 저축 가능액/목표 시점)을
// 보여준다 - 분야는 "상담 분야" 표시에만 쓰이고 이 정보 자체를 바꾸지 않는다.
// 실제로는 goalStore/assetStore 등에 이미 있는 값이지만, consult 화면에서 다른 feature의
// store를 직접 참조하지 않기 위해 같은 모양으로 Mock을 둔다. 값이 비어 있는 항목은
// 상담 정보 화면(ConsultationInfoCard)에서 직접 입력할 수 있게 처리한다.
export const generalConsultInfo = {
  housingPreference: {
    province: { code: '11', name: '서울특별시' },
    district: { code: '11440', name: '마포구' },
    neighborhood: { code: '11440-SEOGYO', name: '서교동' },
    housingType: 'OFFICETEL',
    transactionType: 'JEONSE',
    areaRange: { min: 10, max: 20, label: '10~20평' },
  },
  currentAsset: 45000000,
  monthlySaving: 900000,
  targetDate: '2031-08',
  // 'YES' | 'NO' | 'UNDECIDED'. 선택 정보라 이번 화면에서는 표시하지 않는다.
  loanPreference: 'UNDECIDED',
}

// 가장 가까운 예정 상담 하나. 상담 목록 API가 생기면 이 자리를 그 응답으로 바꾸면 된다.
export const myConsultation = {
  reservationId: 1,
  status: 'RESERVED',
  counselorName: '김민지',
  category: '목표 설정 상담',
  date: '2026-09-09',
  time: '14:00',
}

// 내 상담(/consult/my) 목록 Mock. 상담사 정보는 중복 저장하지 않고 counselorId로만
// counselors를 조회해서 쓴다. status는 RESERVED(예약 완료) / IN_PROGRESS(상담 중) /
// COMPLETED(상담 완료) 3개만 쓴다 - 승인 대기·거절·노쇼 같은 상태는 우리 서비스의
// "시간 선택 = 바로 확정" 정책상 없다.
export const myConsultations = [
  {
    reservationId: 1,
    counselorId: 1,
    category: 'HOUSING',
    reservationDate: '2026-09-09',
    reservationTime: '14:00',
    status: 'RESERVED',
  },
  {
    reservationId: 2,
    counselorId: 2,
    category: 'SAVING',
    reservationDate: '2026-09-06',
    reservationTime: '16:00',
    status: 'IN_PROGRESS',
  },
  {
    reservationId: 3,
    counselorId: 3,
    category: 'ASSET_MANAGEMENT',
    reservationDate: '2026-09-05',
    reservationTime: '13:00',
    status: 'COMPLETED',
  },
]

// 상담사별 예약 가능 일정. 실제 스케줄 API가 생기면 counselorId로 조회하도록 바꾸면 된다.
// key는 counselors[].id. 날짜가 이 목록에 없으면(과거/당일 포함) 예약 화면 캘린더에서
// 선택할 수 없는 날짜로 취급한다.
export const availableReservationSlots = {
  1: [
    {
      date: '2026-09-09',
      slots: [
        { time: '10:00', available: true },
        { time: '11:00', available: false },
        { time: '13:00', available: true },
        { time: '14:00', available: true },
        { time: '15:00', available: true },
        { time: '16:00', available: false },
      ],
    },
    {
      date: '2026-09-10',
      slots: [
        { time: '10:00', available: true },
        { time: '13:00', available: true },
        { time: '15:00', available: false },
      ],
    },
    {
      date: '2026-09-14',
      slots: [
        { time: '11:00', available: true },
        { time: '16:00', available: true },
      ],
    },
  ],
  2: [
    {
      date: '2026-09-09',
      slots: [
        { time: '09:00', available: true },
        { time: '10:00', available: false },
        { time: '16:00', available: true },
      ],
    },
    {
      date: '2026-09-11',
      slots: [
        { time: '10:00', available: true },
        { time: '11:00', available: true },
        { time: '14:00', available: false },
      ],
    },
  ],
  3: [
    {
      date: '2026-09-10',
      slots: [
        { time: '10:00', available: true },
        { time: '13:00', available: true },
      ],
    },
  ],
}
