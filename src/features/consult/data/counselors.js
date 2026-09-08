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

// 최근 진단한 주거 목표 요약. 목표 상세 조회 API가 아직 없어 상담 홈에서 보여줄
// 요약 정보만 Mock으로 둔다. API가 생기면 goalStore 등에서 가져오도록 바꾸면 된다.
export const recentDiagnosisGoal = {
  id: 1,
  region: '서울 마포구',
  transactionType: '전세',
  targetDate: '2031.08',
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
