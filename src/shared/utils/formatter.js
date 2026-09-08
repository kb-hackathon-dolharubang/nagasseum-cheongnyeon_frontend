export function formatDate(date, locale = 'ko-KR') {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date))
}

export function formatCurrency(amount, locale = 'ko-KR', currency = 'KRW') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount)
}

export function formatManwon(amount, locale = 'ko-KR') {
  if (amount === 0) return '0원'
  return `${Math.round(amount / 10000).toLocaleString(locale)}만원`
}

// "32,480,000" 형태로 표기할 때 사용 (단위 없이 천 단위 구분 기호만)
export function formatNumber(amount, locale = 'ko-KR') {
  return new Intl.NumberFormat(locale).format(amount)
}

// "32,480,000원" 형태로 표기할 때 사용 (통화 기호 없이 숫자 + 원 단위)
export function formatWon(amount, locale = 'ko-KR') {
  return `${formatNumber(amount, locale)}원`
}

// "2028-09-30" -> "2028년 9월" (일자는 의미가 없고 연월만 보여주는 목표 시점/달성 시점 표기용)
export function formatYearMonthKo(date) {
  const d = new Date(date)
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월`
}

// "2028-09-30" -> "2028.09" (계좌 만기일 등 짧은 연월 표기용)
export function formatYearMonthDot(date) {
  const d = new Date(date)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`
}

// "2026-08-02T21:40:00+09:00" -> "2026.08.02 21:40" (자산 갱신 시각처럼 날짜+시각을 같이 보여줄 때 사용)
export function formatDateTimeDot(date) {
  const d = new Date(date)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// "9.3억" 형태로 축약 표기 (억 단위 미만은 소수 첫째 자리까지, 불필요한 0은 생략)
export function formatEok(amount) {
  const eok = Number((amount / 100000000).toFixed(1))
  return `${eok}억`
}

// "500,000,000" -> "5억원", "210,000,000" -> "2억 1,000만원", "9,000,000" -> "900만원"
// (억 단위와 만원 단위를 함께 써서 큰 금액을 한눈에 읽기 쉽게 표기. 진행 중인 목표 카드처럼
// 목표/현재/남은 금액을 나란히 보여줄 때 사용)
export function formatEokManwon(amount, locale = 'ko-KR') {
  const eok = Math.floor(amount / 100000000)
  const manwon = Math.round((amount % 100000000) / 10000)

  if (eok === 0) return formatManwon(amount, locale)
  if (manwon === 0) return `${eok}억원`
  return `${eok}억 ${manwon.toLocaleString(locale)}만원`
}

// "2027-08" -> "2027년 8월". null/undefined면 계산 불가 문구로 대체 (홈 화면 예상 달성 시점처럼 null이 올 수 있는 필드용)
export function formatYearMonth(yearMonth, fallback = '예상 시점 계산 불가') {
  if (!yearMonth) return fallback
  const [year, month] = yearMonth.split('-')
  return `${year}년 ${Number(month)}월`
}

// 10, 20 -> "10~20평"
export function formatAreaRange(areaMin, areaMax) {
  return `${areaMin}~${areaMax}평`
}

// 70 -> "5년 10개월", 60 -> "5년", 8 -> "8개월"
// (대출 활용 시 단축되는 개월 수처럼, 개월 수를 년/개월 단위로 함께 읽기 쉽게 표기할 때 사용)
export function formatMonthsToYearsKo(months) {
  const years = Math.floor(months / 12)
  const remainMonths = months % 12

  if (years === 0) return `${remainMonths}개월`
  if (remainMonths === 0) return `${years}년`
  return `${years}년 ${remainMonths}개월`
}

// "2034-12", "2040-06" -> 66 (연월 문자열 사이의 개월 수 차이. 뒤 시점이 더 나중일수록 양수)
export function monthsBetweenYm(fromYm, toYm) {
  const [fromYear, fromMonth] = fromYm.split('-').map(Number)
  const [toYear, toMonth] = toYm.split('-').map(Number)
  return (toYear - fromYear) * 12 + (toMonth - fromMonth)
}

// "202608" -> "8월" (YYYYMM 연월 문자열에서 월만 필요한 이번 달 저축 기록 카드 등에 사용)
export function formatRecordMonth(recordYm) {
  if (!recordYm) return ''
  return `${Number(recordYm.slice(4, 6))}월`
}

// 변동액에 부호를 붙여 "▲ 500만원" / "▼ 500만원" / "0원"(변동 없음)으로 표기
// (비교 기준 문구는 호출부에서 조합해서 붙인다 — 화면마다 기준 시점 표현이 다를 수 있음)
export function formatChangeAmount(amount) {
  const arrow = amount > 0 ? '▲ ' : amount < 0 ? '▼ ' : ''
  return `${arrow}${formatManwon(Math.abs(amount))}`
}

export function formatGoalAmount(amount, locale = 'ko-KR') {
  const eok = Math.floor(amount / 100000000)
  const manwon = Math.round((amount % 100000000) / 10000)

  if (eok === 0) return `${manwon.toLocaleString(locale)}만 원`
  if (manwon === 0) return `${eok}억 원`
  return `${eok}억 ${manwon.toLocaleString(locale)}만 원`
}
