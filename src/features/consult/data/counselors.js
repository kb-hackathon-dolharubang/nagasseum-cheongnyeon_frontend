import counselor1 from '@/assets/images/counselor1.png'
import counselor2 from '@/assets/images/counselor2.png'
import counselor3 from '@/assets/images/counselor3.png'
import climberJeonse from '@/assets/images/climber.png'
import climberMonthly from '@/assets/images/climber3.png'
import climberOwn from '@/assets/images/climber4.png'

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
    image: counselor1,
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
    image: counselor2,
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
    image: counselor3,
  },
  // 목표를 실제로 달성한 사용자 멘토. 전문 상담사와 같은 배열/같은 카드 UI를 그대로 쓰고,
  // isMentor로만 "별점·상담 건수·경력" 대신 "목표 달성 경험"을 보여줄지 가른다(CounselorCard 참고).
  // name에 이미 "멘토" 호칭이 포함되어 있어, 상담사 화면들의 "{{ name }} 상담사" 표기도
  // isMentor일 때는 그 접미사를 붙이지 않는다.
  //
  // image는 상담사 사진(counselor1~3)과 달리 1086x1448 전신 그림이라 동그란 아바타에
  // object-fit: cover만 쓰면 얼굴이 너무 작게 잘린다. 마이페이지 프로필(useAvatar.js
  // AVATAR_OPTIONS)이 같은 원본 이미지에 얼굴 중심으로 확대/위치 조정한 crop 값을 이미
  // 계산해뒀으므로 그 값을 그대로 재사용한다 - 이미지가 같으니 배율도 그대로 맞는다.
  {
    id: 4,
    name: '전세한걸음 멘토',
    title: '전세 독립 경험 멘토',
    achievement: '서울 · 전세 · 3년 만에 목표 달성',
    categories: ['목표 설정', '저축', '주거'],
    earliestAvailable: '9월 10일 14:00',
    image: climberJeonse,
    crop: { width: '123.4%', left: '-12.4%', top: '4.5%' },
    isMentor: true,
  },
  {
    id: 5,
    name: '자취새싹 멘토',
    title: '월세 독립 경험 멘토',
    achievement: '서울 · 월세 · 2년 만에 목표 달성',
    categories: ['저축', '주거', '자산 관리'],
    earliestAvailable: '9월 10일 16:00',
    image: climberMonthly,
    crop: { width: '110%', left: '-6%', top: '9.5%' },
    isMentor: true,
  },
  {
    id: 6,
    name: '내집앞으로 멘토',
    title: '내 집 마련 경험 멘토',
    achievement: '경기 · 매매 · 5년 만에 목표 달성',
    categories: ['주거', '대출', '자산 관리'],
    earliestAvailable: '9월 11일 10:00',
    image: climberOwn,
    crop: { width: '108%', left: '-8%', top: '11.5%' },
    isMentor: true,
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
  region: '서울 관악구',
  transactionType: '전세',
  targetDate: '2029.07',
  originalCondition: {
    province: { code: '11', name: '서울특별시' },
    district: { code: '11620', name: '관악구' },
    neighborhood: { code: '11620-BONGCHEON', name: '봉천동' },
    housingType: 'OFFICETEL',
    transactionType: 'JEONSE',
    areaRange: { min: 10, max: 20, label: '10~20평' },
  },
  // 진단 결과의 REALISTIC 추천(면적을 원룸 수준으로 줄인 조건)과 같은 조건이다.
  recommendedCondition: {
    province: { code: '11', name: '서울특별시' },
    district: { code: '11620', name: '관악구' },
    neighborhood: { code: '11620-BONGCHEON', name: '봉천동' },
    housingType: 'OFFICETEL',
    transactionType: 'JEONSE',
    areaRange: { min: 4, max: 9, label: '4~9평' },
  },
  // 위 추천 조건(4~9평)을 대출 없이 목표 시점(2029-07)까지 맞추려면 필요한 금액
  // (1.05억 − 순자산 2,500만원 = 8,000만원을 34개월에 나눈 값). 상담에서 "대출을 끼면
  // 얼마까지 줄어드는지"를 짚어주기 위한 출발점이라 일부러 대출 미반영 금액을 둔다.
  recommendedMonthlySaving: 2360000,
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
    district: { code: '11620', name: '관악구' },
    neighborhood: { code: '11620-BONGCHEON', name: '봉천동' },
    housingType: 'OFFICETEL',
    transactionType: 'JEONSE',
    areaRange: { min: 10, max: 20, label: '10~20평' },
  },
  // 자산 요약 화면의 순자산(총자산 3,000만원 − 학자금대출 500만원)과 같은 값이다.
  currentAsset: 25000000,
  monthlySaving: 700000,
  targetDate: '2029-07',
  // 'YES' | 'NO' | 'UNDECIDED'. 선택 정보라 이번 화면에서는 표시하지 않는다.
  loanPreference: 'UNDECIDED',
}

// 상담 홈의 "최근 진단한 목표" 요약 카드가 데이터 있음 상태와 Empty State 중 어느
// 쪽을 보여줄지 이 값으로 정한다. recentDiagnosisGoal은 상담 정보/상담 리포트
// 화면(buildConsultInfo, ConsultationInfoCard)에서도 그대로 참조하고 있어 값 자체를
// 지우면 그 화면들이 깨진다 - 그래서 원본은 그대로 두고, 상담 홈만 이 플래그로
// "있는 것으로 볼지"를 따로 가른다. Empty State를 확인하려면 아래 값을 false로 바꾸면 된다.
export const HAS_RECENT_DIAGNOSIS = true
// export const HAS_RECENT_DIAGNOSIS = false

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
  name: '김지우',
  image: '',
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
  // 멘토(id 4~6)도 상담사와 같은 예약 화면·flow를 그대로 타므로, earliestAvailable에 표시한
  // 날짜/시간을 실제로 선택 가능한 슬롯으로도 넣어둔다.
  4: [
    {
      date: '2026-09-10',
      slots: [
        { time: '14:00', available: true },
        { time: '16:00', available: true },
      ],
    },
  ],
  5: [
    {
      date: '2026-09-10',
      slots: [
        { time: '13:00', available: true },
        { time: '16:00', available: true },
      ],
    },
  ],
  6: [
    {
      date: '2026-09-11',
      slots: [
        { time: '10:00', available: true },
        { time: '15:00', available: true },
      ],
    },
  ],
}
