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

// 상담 홈의 "최근 진단한 목표"/"내 상담" 요약 카드가 데이터 있음 상태와 Empty State
// 중 어느 쪽을 보여줄지 이 두 값으로 정한다. recentDiagnosisGoal은 상담 정보/상담
// 리포트 화면(buildConsultInfo, ConsultationInfoCard)에서도 그대로 참조하고 있어
// 값 자체를 지우면 그 화면들이 깨진다 - 그래서 원본은 그대로 두고, 상담 홈만 이
// 플래그로 "있는 것으로 볼지"를 따로 가른다. Empty State를 확인하려면 아래 두 값을
// false로 바꾸면 된다.
export const HAS_RECENT_DIAGNOSIS = true
export const HAS_MY_CONSULTATION = true
// export const HAS_RECENT_DIAGNOSIS = false
// export const HAS_MY_CONSULTATION = false

// 내 상담(/consult/my) 목록 Mock. 상담사 정보는 중복 저장하지 않고 counselorId로만
// counselors를 조회해서 쓴다. status는 RESERVED(예약 완료) / IN_PROGRESS(상담 중) /
// COMPLETED(상담 완료) 3개만 쓴다 - 승인 대기·거절·노쇼 같은 상태는 우리 서비스의
// "시간 선택 = 바로 확정" 정책상 없다. consultationType은 예약 화면에서 어떤 방식으로
// 들어왔는지를 그대로 남긴 값으로, 상담 리포트가 "상담 기준 정보"를 만들 때
// buildConsultInfo(consultationType)에 그대로 넘겨 쓴다.
export const myConsultations = [
  {
    reservationId: 1,
    counselorId: 1,
    category: 'HOUSING',
    consultationType: 'GOAL_DIAGNOSIS',
    reservationDate: '2026-09-09',
    reservationTime: '14:00',
    status: 'RESERVED',
  },
  {
    reservationId: 2,
    counselorId: 2,
    category: 'SAVING',
    consultationType: 'GENERAL',
    reservationDate: '2026-09-06',
    reservationTime: '16:00',
    status: 'IN_PROGRESS',
  },
  {
    reservationId: 3,
    counselorId: 3,
    category: 'ASSET_MANAGEMENT',
    consultationType: 'GENERAL',
    reservationDate: '2026-09-05',
    reservationTime: '13:00',
    status: 'COMPLETED',
  },
]

// "YYYY-MM-DD" 문자열로 오늘/이후 날짜를 계산한다. 실제 실행일과 무관하게 상담사
// 홈의 오늘의 상담/다가오는 상담 구분이 항상 맞게 보이도록, 고정 날짜 대신 현재
// 시각 기준으로 날짜를 만든다 - 새 날짜 라이브러리는 쓰지 않는다.
function formatDateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
function addDays(base, days) {
  const result = new Date(base)
  result.setDate(result.getDate() + days)
  return result
}
const today = new Date()

// 상담사 홈(/counselor) Mock. 상담사 입장에서 자신에게 예약된 상담 목록이라 여러
// 사용자가 섞여 있다 - reservationId 2는 사용자 쪽 myConsultations[1](이서현 · 저축
// 상담 · IN_PROGRESS)과 같은 예약이라 chatMessages[2]의 기존 대화가 그대로 이어진다.
// 나머지는 상담사 홈 전용으로 새로 추가한 예약(다른 사용자)이라 아직 대화가 없다.
export const counselorConsultations = [
  {
    reservationId: 2,
    counselorId: 2,
    userId: 101,
    userName: '김유진',
    category: 'SAVING',
    reservationDate: '2026-09-06',
    reservationTime: '16:00',
    status: 'IN_PROGRESS',
  },
  {
    reservationId: 4,
    counselorId: 2,
    userId: 102,
    userName: '박서연',
    category: 'HOUSING',
    reservationDate: formatDateKey(today),
    reservationTime: '10:00',
    status: 'RESERVED',
  },
  {
    reservationId: 5,
    counselorId: 2,
    userId: 103,
    userName: '최민지',
    category: 'LOAN',
    reservationDate: formatDateKey(today),
    reservationTime: '15:00',
    status: 'RESERVED',
  },
  {
    reservationId: 6,
    counselorId: 2,
    userId: 104,
    userName: '정하늘',
    category: 'GOAL_SETTING',
    reservationDate: formatDateKey(addDays(today, 1)),
    reservationTime: '11:00',
    status: 'RESERVED',
  },
  {
    reservationId: 7,
    counselorId: 2,
    userId: 105,
    userName: '이도윤',
    category: 'ASSET_MANAGEMENT',
    reservationDate: formatDateKey(addDays(today, 3)),
    reservationTime: '14:00',
    status: 'RESERVED',
  },
]

// 채팅 화면(/consult/chat/:reservationId) Mock 메시지. key는 myConsultations[].reservationId다.
// 상담사 이름/이미지는 counselors에서 counselorId로 조회해서 쓰므로 여기에 다시 넣지 않는다.
// 실제 백엔드가 생기면 GET /chat/{reservationId}/messages 응답으로 이 자리를 대체하면 된다.
export const chatMessages = {
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

// 상담사(COUNSELOR) 역할로 채팅 화면을 확인할 때 상단에 표시할 사용자 쪽 Mock 프로필.
// 아직 회원 프로필 조회 API가 없어 데모 확인용으로만 최소 형태로 둔다.
export const chatUserProfile = {
  name: '김OO',
  image: '',
}

// AI 상담 리포트(/consult/report/:reservationId) Mock. key는 myConsultations[].reservationId다.
// 여기에는 AI가 실제로 만들어내는 값만 둔다(summary/mainConcerns/discussionPoints/result/
// recommendations/nextActions) - 상담사·예약 일시·분야, 그리고 "상담 기준 정보"(희망 주거
// 조건/현재 자산/월 저축 가능액/목표 시점, 진단 결과)는 이미 counselors/myConsultations/
// recentDiagnosisGoal/generalConsultInfo에 있는 값을 그대로 재사용하므로 여기서 다시
// 만들지 않는다. 필드 구조는 추후 실제 AI Response와 그대로 맞바꿀 수 있게 유지한다.
// reservationId 1처럼 이 객체에 키가 없으면 "아직 AI가 만들지 않은 상태"로 보고
// 화면에서 생성 중(GENERATING)으로 처리한다.
export const consultationReports = {
  2: {
    status: 'COMPLETED',
    summary:
      '이번 상담에서는 현재 자산과 희망 주거 조건을 기준으로 목표 시점까지 저축 계획을 함께 점검했습니다. 지금 속도로는 목표 시점에 다소 못 미칠 수 있어 월 저축액 조정이 필요하다는 점을 확인했습니다.',
    mainConcerns: [
      '지금 저축 속도로 목표 시점을 맞출 수 있는지',
      '월 저축액을 얼마나 늘려야 하는지',
    ],
    discussionPoints: [
      '현재 자산과 목표 필요 금액 비교',
      '희망 주거 조건의 예상 비용 확인',
      '목표 시점까지 남은 기간과 필요 저축액 계산',
      '정책 대출 활용 가능성 확인',
    ],
    result:
      '현재 조건을 유지하려면 월 저축액을 늘리거나 목표 시점을 조정하는 방향이 현실적이라는 결론을 확인했습니다.',
    recommendations: [
      '월 저축액 조정 검토',
      '목표 시점 조정 검토',
      '정책 대출 활용 가능 여부 확인',
    ],
    nextActions: [
      {
        title: '월 저축 계획을 조정해보세요',
        description: '현재 월 70만원에서 상향 조정하는 방안을 검토해보세요.',
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
  },
  3: {
    status: 'COMPLETED',
    summary:
      '이번 상담에서는 현재 보유 자산 구성과 목표 시점을 함께 검토했습니다. 자산 배분을 조정하면 목표 달성 시점을 앞당길 여지가 있다는 점을 확인했습니다.',
    mainConcerns: ['현재 자산 배분이 목표에 적절한지', '목표 시점을 앞당길 수 있는 방법이 있는지'],
    discussionPoints: [
      '현재 자산 구성과 목표 필요 금액 비교',
      '희망 주거 조건의 예상 비용 확인',
      '자산 배분 조정 시 기대 효과 검토',
    ],
    result: '현재 자산 배분을 일부 조정하면 목표 시점을 앞당길 수 있다는 결론을 확인했습니다.',
    recommendations: ['자산 배분 조정 검토', '월 저축액 유지 여부 확인'],
    nextActions: [
      {
        title: '목표 조건을 다시 확인해보세요',
        description: '상담 결과를 반영해 목표 시점이나 주거 조건을 수정할 수 있습니다.',
        actionType: 'GOAL',
      },
      {
        title: '저축 계획을 확인해보세요',
        description: '현재 월 저축액이 목표에 적절한지 다시 확인해보세요.',
        actionType: 'SAVING',
      },
    ],
  },
}

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
