import {
  formatAreaRange,
  formatGoalAmount,
  formatYearMonth,
  formatMonthsToYearsKo,
} from '@/shared/utils/formatter'
import { HOUSING_TYPE_LABEL, DEAL_TYPE_LABEL } from '@/shared/constants/housing'

// 진단 결과 화면(추천 계획 비교 리스트)의 카드 정렬 순서. API 배열 순서를 그대로 믿지 않고
// 항상 이 순서로 재정렬한다. 목록에 없는(향후 추가될) type은 정의된 type들 뒤에 붙인다.
// PREFERENCE_DATE_FIXED는 사용자가 목표 시점을 입력하지 않으면 응답 자체에 없을 수 있다
// (없으면 그냥 카드가 하나 빠질 뿐, 빈 자리나 placeholder를 만들지 않는다).
const TYPE_ORDER = {
  PREFERENCE_SAVING_FIXED: 0,
  PREFERENCE_DATE_FIXED: 1,
  REALISTIC: 2,
  HOLD_OUT: 3,
}

// 결과 화면에서 "희망 조건을 기준으로" 그룹에 묶이는 type. 나머지(REALISTIC/HOLD_OUT 등)는
// "다른 선택지도 살펴보세요" 그룹으로 분류된다.
const PREFERENCE_GROUP_TYPES = new Set(['PREFERENCE_SAVING_FIXED', 'PREFERENCE_DATE_FIXED'])

// API의 title을 그대로 쓰지 않고 화면 전용 제목으로 바꾼다.
export const RECOMMENDATION_TITLE_MAP = {
  PREFERENCE_SAVING_FIXED: '지금 저축대로 모으면',
  PREFERENCE_DATE_FIXED: '목표 시점에 맞추려면',
  REALISTIC: '현재 준비 상황을 반영하면',
  HOLD_OUT: '선택의 폭을 넓혀보면',
}

// 제목 아래 한 줄로 각 계획이 무엇을 보여주는지 자연어 문장으로 설명한다. "월 저축 유지 ·
// 예상 시점 계산"처럼 알고리즘 절차를 나열하지 않고, 사용자가 이 카드를 눌러야 하는 이유를
// 문장으로 전달한다.
export const RECOMMENDATION_STRATEGY_MAP = {
  PREFERENCE_SAVING_FIXED: '지금처럼 모았을 때 언제 도달하는지 확인해보세요',
  PREFERENCE_DATE_FIXED: '원하는 시점까지 필요한 저축액을 확인해보세요',
  REALISTIC: '현재 자금과 저축을 반영한 주거 선택지예요',
  HOLD_OUT: '조금 더 준비했을 때 고려할 수 있는 주거 선택지예요',
}

// 비교 카드로 그릴 수 있는(유효한) 추천인지 판별한다. 백엔드는 "현재 저축 계획으로는 원하는
// 조건 달성이 어려운" HOLD_OUT 케이스를 condition/loanX 전부 null(안내용 title·reason만 채운)로
// 내려준다 — 이 카드는 지역·유형·금액·시점을 비교해 보여주는 게 목적이라 그 값들이 없으면 그릴 수
// 없으므로 목록에서 제외한다(배포 동작과 동일). 비교 대상이 아닌 안내 문구는 카드로 만들지 않는다.
export function isComparableRecommendation(recommendation) {
  return recommendation?.condition != null && recommendation?.loanX != null
}

// API 배열을 화면에 표시할 순서로 정렬한다. 정의된 type 우선순위 뒤로는 원래 순서를 유지한다.
export function sortRecommendations(recommendations) {
  return [...(recommendations ?? [])].sort(
    (a, b) =>
      (TYPE_ORDER[a.type] ?? Number.MAX_SAFE_INTEGER) -
      (TYPE_ORDER[b.type] ?? Number.MAX_SAFE_INTEGER),
  )
}

// 결과 화면 카드 목록을 "희망 조건을 기준으로"/"다른 선택지도 살펴보세요" 두 그룹으로 나눈다.
// 정렬·비교 가능 여부 필터링까지 이 함수 하나로 끝내, 화면(템플릿)에는 type 분기가 남지 않게 한다.
export function groupRecommendationsForResult(recommendations) {
  const sorted = sortRecommendations(recommendations).filter(isComparableRecommendation)
  return {
    preferenceGroup: sorted.filter((item) => PREFERENCE_GROUP_TYPES.has(item.type)),
    otherGroup: sorted.filter((item) => !PREFERENCE_GROUP_TYPES.has(item.type)),
  }
}

// 결과 화면 카드용 "지역 · 유형 · 거래 · 면적" 한 줄 요약. 세 계획을 빠르게 비교하는 게 목적이라
// 상세 화면(toHousingViewModel)처럼 지역/조건/면적을 줄바꿈해서 나누지 않고 하나로 합친다.
// "전용" 접두어는 붙이지 않고 면적(평)을 그대로 이어붙인다.
// "서울 마포구 · 아파트 · 전세 · 10~20평" (월세면서 실제 월세액이 있으면 "· 월 60만 원"을 이어붙인다)
export function toConditionSummary(condition) {
  const summary = [
    condition.regionName,
    HOUSING_TYPE_LABEL[condition.housingType] ?? condition.housingType,
    DEAL_TYPE_LABEL[condition.dealType] ?? condition.dealType,
    `${condition.areaMin}~${condition.areaMax}평`,
  ]
    .filter(Boolean)
    .join(' · ')

  if (condition.dealType === 'WOLSE' && condition.monthlyRent > 0) {
    return `${summary} · 월 ${formatGoalAmount(condition.monthlyRent)}`
  }
  return summary
}

// "15~20평" (월세면서 실제 월세액이 있으면 "· 월 60만 원"을 이어붙인다)
// 결과 화면과 용어를 통일하기 위해 "전용" 접두어는 붙이지 않는다.
function toConditionArea(condition) {
  const areaLabel = formatAreaRange(condition.areaMin, condition.areaMax)

  if (condition.dealType === 'WOLSE' && condition.monthlyRent > 0) {
    return `${areaLabel} · 월 ${formatGoalAmount(condition.monthlyRent)}`
  }
  return areaLabel
}

// 결과 카드 2열 핵심 정보. "왼쪽 = 시점, 오른쪽 = 저축액"으로 두 PREFERENCE 카드의 배치를
// 통일해, 두 카드를 위아래로 비교할 때 같은 종류의 정보가 같은 자리에 오게 한다(REALISTIC/
// HOLD_OUT은 시점 대신 금액을 다루므로 이 규칙과 무관하게 기존 "준비 가능 예산 → 예상 도달
// 시점" 순서를 유지한다). emphasized는 그 recommendation의 "계산된 결과값"이 어느 쪽인지
// 나타내며(나머지 한쪽은 입력/기준값), RecommendationCard가 그 쪽 font-weight만 한 단계
// 높인다(font-size·색상은 바꾸지 않는다) — type별 분기는 여기서 끝내고 컴포넌트에는
// if(type === ...) 형태의 분기를 남기지 않는다.
// - PREFERENCE_SAVING_FIXED: 월 저축을 고정해두고 계산한 결과라 "월 50만 원을 유지하면 →
//   2051년 8월에 도달"이 핵심이다. 계산 결과값은 예상 도달 시점(왼쪽)이다. targetAmount는
//   이 카드에서 메인 비교 수치가 아니다.
// - PREFERENCE_DATE_FIXED: 반대로 목표 시점을 고정해두고 계산한 결과라 "2031년 8월까지
//   가려면 → 월 520만 원 필요"가 핵심이다. 계산 결과값은 필요 월 저축(오른쪽)이다.
//   monthlySaving은 사용자의 기존 저축액이 아니라 그 시점에 도달하기 위해 새로 계산된
//   필요 저축액이므로 label을 "필요 월 저축"으로 명확히 한다.
// - REALISTIC/HOLD_OUT: loanX.targetAmount는 집값(condition.marketMedianAmount)이 아니라
//   사용자가 이 시점까지 대출 없이 준비할 수 있는 예산이다. 추천 자체가
//   "marketMedianAmount(목표 시점 예상 시세) < loanX.targetAmount(준비 가능 예산)"일 때만
//   성립하는 구조라("이 예산이면 이 조건을 살 수 있다"), 왼쪽(준비 가능 예산)이 이 계획의
//   핵심 결과값이다.
function toRecommendationMetrics({ type, loanX }) {
  if (type === 'PREFERENCE_SAVING_FIXED') {
    return {
      left: {
        label: '예상 도달 시점',
        value: formatYearMonth(loanX.targetDate),
        emphasized: true,
      },
      right: {
        label: '월 저축',
        value: formatGoalAmount(loanX.monthlySaving),
        emphasized: false,
      },
    }
  }

  if (type === 'PREFERENCE_DATE_FIXED') {
    return {
      left: {
        label: '목표 시점',
        value: formatYearMonth(loanX.targetDate),
        emphasized: false,
      },
      right: {
        label: '필요 월 저축',
        value: formatGoalAmount(loanX.monthlySaving),
        emphasized: true,
      },
    }
  }

  return {
    left: {
      // loanX.targetAmount는 집값(marketMedianAmount)이 아니라 사용자가 이 시점까지
      // 대출 없이 준비할 수 있는 예산이다 — "목표 금액"이라고 하면 집값처럼 읽혀서
      // "준비 가능 예산"으로 명확히 한다.
      label: '준비 가능 예산',
      value: formatGoalAmount(loanX.targetAmount),
      emphasized: true,
    },
    right: {
      label: '예상 도달 시점',
      value: formatYearMonth(loanX.targetDate),
      emphasized: false,
    },
  }
}

// recommendation 원본 응답을 RecommendationCard가 그대로 그릴 수 있는 표시용 값으로 변환한다.
export function toRecommendationViewModel(recommendation) {
  const { type, condition } = recommendation
  const { left, right } = toRecommendationMetrics(recommendation)

  return {
    type,
    title: RECOMMENDATION_TITLE_MAP[type] ?? recommendation.title,
    strategy: RECOMMENDATION_STRATEGY_MAP[type] ?? '',
    conditionSummary: toConditionSummary(condition),
    left,
    right,
  }
}

// 상세 화면 상단 한 줄 설명. REALISTIC/HOLD_OUT은 고정 문구지만, PREFERENCE 두 type은 사용자가
// 실제로 입력/도달하는 값(월 저축액·목표 시점)을 문장에 그대로 넣어야 해서 동적으로 만든다
// (mock 숫자를 하드코딩하지 않고 항상 loanX 값을 formatter로 표시한다).
const RECOMMENDATION_DETAIL_DESCRIPTION_MAP = {
  REALISTIC: '현재 상황을 고려한 주거 선택지예요.',
  HOLD_OUT: '조금 더 준비했을 때 고려할 수 있는 선택지예요.',
}

export function toRecommendationDescription(recommendation) {
  if (!recommendation) return ''
  const { type, loanX } = recommendation

  if (type === 'PREFERENCE_SAVING_FIXED') {
    return `월 ${formatGoalAmount(loanX.monthlySaving)}씩 꾸준히 모았을 때의 계획이에요.`
  }
  if (type === 'PREFERENCE_DATE_FIXED') {
    return `${formatYearMonth(loanX.targetDate)}까지 준비하기 위해 필요한 저축액을 계산했어요.`
  }
  return RECOMMENDATION_DETAIL_DESCRIPTION_MAP[type] ?? ''
}

// 상세 화면 "주거 조건" 카드용. 목록 카드(toConditionSummary)와 달리 지역명을 독립된 줄로 강조하고
// 유형·거래는 별도 줄로 낮춰 보여줘야 해서 별도로 조합한다. marketMedianAmount는 아직 백엔드
// 응답에 없을 수 있어(23번 요구사항) null-safe하게 처리하고, 없으면 호출부가 그 줄을 숨긴다.
//
// marketMedianAmount는 "현재" 실거래 중앙값이 아니라, targetDate(이 recommendation의 목표
// 시점) 기준으로 예측한 미래 시세다 — 그래서 반드시 targetDate와 함께 표시해야 하고, 날짜
// 없이 금액만 보여주면 지금 시세처럼 오해할 수 있다. targetDate가 없으면(이론상 없을 수
// 없지만 방어적으로) 날짜 없는 라벨은 만들지 않는다.
export function toHousingViewModel(condition, targetDate) {
  const hasMarketMedian = typeof condition.marketMedianAmount === 'number'

  return {
    regionName: condition.regionName,
    typeLine: [
      HOUSING_TYPE_LABEL[condition.housingType] ?? condition.housingType,
      DEAL_TYPE_LABEL[condition.dealType] ?? condition.dealType,
    ].join(' · '),
    areaLine: toConditionArea(condition),
    marketMedianAmountLabel: hasMarketMedian
      ? formatGoalAmount(condition.marketMedianAmount)
      : null,
    // "실거래 중앙값"이라고만 하면 지금 시세처럼 읽혀서, "OOOO년 O월 예상 시세"처럼 예측
    // 시점을 라벨 자체에 포함한다.
    marketMedianDateLabel:
      hasMarketMedian && targetDate ? `${formatYearMonth(targetDate)} 예상 시세` : '예상 시세',
    sampleCountLabel:
      condition.sampleCount > 0
        ? `같은 조건의 실거래 ${condition.sampleCount.toLocaleString('ko-KR')}건을 바탕으로 예측했어요.`
        : null,
  }
}

// 상세 화면 "핵심 카드"(주거 조건 카드 바로 아래)용. REALISTIC은 조건·시세 자체가 이미
// 핵심 결과라 이 카드를 따로 두지 않는다(null이면 호출부가 카드를 숨긴다). 나머지 세 type은
// "A → B" 관계를 강조하는 게 목적이라 같은 compare-box 스타일(RecommendationCompareCard)을
// 재사용하되, type마다 비교하는 값이 다르다.
export function toCompareCardViewModel(recommendation, recommendations) {
  if (!recommendation) return null
  const { type, loanX } = recommendation

  if (type === 'PREFERENCE_SAVING_FIXED') {
    return {
      title: '지금처럼 모으면',
      rows: [
        {
          fromLabel: '월 저축',
          fromValue: formatGoalAmount(loanX.monthlySaving),
          toLabel: '예상 도달 시점',
          toValue: formatYearMonth(loanX.targetDate),
        },
      ],
    }
  }

  if (type === 'PREFERENCE_DATE_FIXED') {
    return {
      title: '이때까지 준비하려면',
      rows: [
        {
          fromLabel: '목표 시점',
          fromValue: formatYearMonth(loanX.targetDate),
          toLabel: '필요 월 저축',
          toValue: formatGoalAmount(loanX.monthlySaving),
        },
      ],
    }
  }

  if (type === 'HOLD_OUT') {
    const realistic = (recommendations ?? []).find((item) => item.type === 'REALISTIC')
    return toHoldOutCompareRows(realistic, recommendation)
  }

  return null
}

// HOLD_OUT은 REALISTIC과 비교해야 의미가 있어, 같은 응답 안에서 배열 순서가 아니라 항상
// type으로 REALISTIC을 찾는다(호출부 책임). "현재 준비 상황 반영"/"선택의 폭 확대"처럼
// 카드 제목과 같은 말을 항목마다 반복하지 않고, 실제로 값이 달라진 조건만 골라 그
// 항목명(지역/주택 유형/거래 유형/면적)을 직접 보여준다. 우선순위는 이 순서 그대로이며,
// 동일한 값은 항목 자체를 만들지 않는다 — 이미 "이런 집이에요" 카드에서 볼 수 있는 정보를
// 여기서 다시 반복하지 않기 위함이다. 실제로 달라진 항목이 하나도 없으면(이론상 두
// condition이 완전히 같으면) null을 돌려주고 호출부가 카드를 숨긴다.
//
// marketMedianAmount(예상 시세)는 여기서 다루지 않는다 — REALISTIC과 HOLD_OUT은
// loanX.targetDate(목표 시점)가 서로 달라 두 시세를 나란히 비교하면 같은 시점 가격
// 비교처럼 오해할 수 있다. 각 recommendation의 예상 시세는 시점과 함께 "이런 집이에요"
// 상세 카드에서 확인하도록 한다.
function toHoldOutCompareRows(realistic, holdOut) {
  if (!realistic || !holdOut) return null
  const before = realistic.condition
  const after = holdOut.condition
  if (!before || !after) return null

  const items = []

  if (before.regionCode !== after.regionCode) {
    items.push({
      key: 'region',
      label: '지역',
      fromValue: before.regionName,
      toValue: after.regionName,
    })
  }

  if (before.housingType !== after.housingType) {
    items.push({
      key: 'housingType',
      label: '주택 유형',
      fromValue: HOUSING_TYPE_LABEL[before.housingType] ?? before.housingType,
      toValue: HOUSING_TYPE_LABEL[after.housingType] ?? after.housingType,
    })
  }

  if (before.dealType !== after.dealType) {
    items.push({
      key: 'dealType',
      label: '거래 유형',
      fromValue: DEAL_TYPE_LABEL[before.dealType] ?? before.dealType,
      toValue: DEAL_TYPE_LABEL[after.dealType] ?? after.dealType,
    })
  }

  // areaMin/areaMax를 각각 따로 비교하지 않고 "4~9평" 같은 완성된 range 문자열로 합쳐서
  // 비교한다 — 둘 중 하나만 달라도 면적이라는 하나의 항목으로 묶인다.
  const beforeArea = formatAreaRange(before.areaMin, before.areaMax)
  const afterArea = formatAreaRange(after.areaMin, after.areaMax)
  if (beforeArea !== afterArea) {
    items.push({ key: 'area', label: '면적', fromValue: beforeArea, toValue: afterArea })
  }

  if (items.length === 0) return null

  return {
    title: '선택의 폭을 넓히면 이렇게 달라져요',
    rows: items,
  }
}

// "대출 없이" 컬럼에는 예상 대출 금액이라는 개념 자체가 없다 — 0원이 아니라 "해당 없음"이므로
// 억지로 숫자를 만들지 않고 이 자리표시자로 비워둔다.
const NO_LOAN_AMOUNT_PLACEHOLDER = '-'

// loanO가 있을 때 하단 강조 문구용. PREFERENCE_DATE_FIXED는 목표 시점이 이미 고정돼 있어
// 대출 효과를 "기간 단축"이 아니라 "월 저축 부담 감소"로 보여준다 — 반대로 나머지 세
// type은 월 저축액(또는 목표 자체)이 고정이라 대출 효과가 "도달 시점 단축"이다. 두 경우
// 모두 실제로 줄어드는 값이 없으면(0 이하) null을 돌려줘 문구 자체를 지어내지 않는다.
function toFundingHighlight({ type, loanX, loanO }) {
  if (type === 'PREFERENCE_DATE_FIXED') {
    const reducedMonthlySaving = Math.max(loanX.monthlySaving - loanO.monthlySaving, 0)
    if (reducedMonthlySaving <= 0) return null
    return {
      prefix: '대출을 활용하면 필요한 월 저축액이',
      emphasis: formatGoalAmount(reducedMonthlySaving),
      suffix: '줄어들어요.',
    }
  }

  if (typeof loanO.shortenedMonths !== 'number' || loanO.shortenedMonths <= 0) return null
  return {
    prefix: '대출을 활용하면 도달 시점이',
    emphasis: formatMonthsToYearsKo(loanO.shortenedMonths),
    suffix: '앞당겨져요.',
  }
}

// 대출 없이/활용 시 값이 같은 row는 좌우로 반복해서 보여주지 않고 공통값 한 번으로
// 합친다 — 실제로 달라지는 값만 비교해야 눈에 잘 띈다. 포맷팅 전 raw 값으로 먼저 같은지
// 판단해야, 표시 문자열이 우연히 같아 보이는 경우와 실제로 같은 값인 경우를 확실히
// 구분할 수 있다.
//
// muted:true(예상 대출 금액)가 아닌 한, 값이 다르면 "대출 활용 시" 쪽(오른쪽)이 대출을
// 썼을 때 실제로 달라지는 결과이므로 그 쪽만 emphasis를 준다 — type마다 어느 row가
// 핵심인지 미리 정하지 않고, 실제로 달라진 값이면 어떤 row든 같은 규칙으로 강조된다.
function createFundingRow({ label, rawWithoutLoan, rawWithLoan, format, muted = false }) {
  const isSame = rawWithoutLoan === rawWithLoan

  return {
    label,
    isSame,
    muted,
    withoutLoan: format(rawWithoutLoan),
    withLoan: format(rawWithLoan),
    common: isSame ? format(rawWithoutLoan) : null,
  }
}

// 상세 화면 "이 목표를 준비하려면" 카드용. PREFERENCE_SAVING_FIXED/PREFERENCE_DATE_FIXED/
// REALISTIC/HOLD_OUT 네 type 모두 완전히 같은 4행 · 좌우 2열("대출 없이"/"대출 활용 시")
// 비교 구조를 쓴다 — type마다 표를 다시 해석하지 않도록 순서·컬럼을 고정한다.
//
// row 순서는 "직접 준비할 금액 → 예상 대출 금액 → 월 저축 → 예상 도달 시점" 고정이다.
// 어떤 type이 어떤 row를 공통값으로 합칠지도 미리 정해두지 않고, 매번 실제 loanX/loanO
// 값을 비교해 결정한다(예: SAVING_FIXED는 보통 월 저축이 같아 합쳐지고, DATE_FIXED는
// 보통 예상 도달 시점이 같아 합쳐지지만, 이는 데이터에 따라 달라질 수 있는 결과일 뿐
// type별로 고정된 규칙이 아니다). "예상 대출 금액"은 결과가 아니라 다른 row가 달라지는
// 원인이 되는 조건이라 muted로 한 단계 낮춘다.
//
// "대출 반영 목표 금액"처럼 계산 과정을 설명하는 용어 대신, loanO.targetAmount(전체
// 금액에서 대출금을 뺀 나머지)를 "직접 준비할 금액"으로 통일해 실제로 준비해야 하는
// 돈이 얼마인지 바로 읽히게 한다. loanO가 없으면 오른쪽(대출 활용 시) 컬럼과 하단
// 강조 문구를 통째로 비워, 호출부가 왼쪽 컬럼만 그리도록 한다.
export function toFundingViewModel({ type, loanX, loanO }) {
  const rows = [
    createFundingRow({
      label: '준비 금액',
      rawWithoutLoan: loanX.targetAmount,
      rawWithLoan: loanO?.targetAmount,
      format: formatGoalAmount,
    }),
    // 대출 없이는 "예상 대출 금액" 자체가 존재하지 않는 개념이라(0원이 아니라 해당 없음)
    // 두 값이 같아지는 경우가 있을 수 없다 — 항상 좌우 비교형으로 고정한다. 이 값은
    // 결과가 아니라 다른 row들이 달라지는 원인이 되는 조건이라 muted로 한 단계 낮춘다.
    {
      label: '예상 대출 금액',
      isSame: false,
      muted: true,
      withoutLoan: NO_LOAN_AMOUNT_PLACEHOLDER,
      withLoan: loanO ? formatGoalAmount(loanO.loanAmount) : null,
      common: null,
    },
    createFundingRow({
      label: '월 저축',
      rawWithoutLoan: loanX.monthlySaving,
      rawWithLoan: loanO?.monthlySaving,
      format: formatGoalAmount,
    }),
    createFundingRow({
      label: '예상 도달 시점',
      rawWithoutLoan: loanX.targetDate,
      rawWithLoan: loanO?.targetDate,
      format: formatYearMonth,
    }),
  ]

  return {
    hasLoan: loanO != null,
    rows,
    highlight: loanO ? toFundingHighlight({ type, loanX, loanO }) : null,
  }
}

// "이 계획으로 목표 설정하기" 저장 payload(goalApi.postGoal 기대 형태)로 매핑한다.
// - sizeMin/sizeMax: condition.areaMin/Max를 그대로 사용
// - depositMin/depositMax: condition에 포함된 값을 그대로 전달 (백엔드 @NotNull)
// - monthlyRentMin/monthlyRentMax: 범위가 아니라 단일값(monthlyRent)이라 WOLSE면 그 값을
//   min=max로 두는 점(point) 근사, JEONSE면 null
// - targetDate/targetAmount/monthlySavings: plan(목표 설정 확인 팝업에서 최종 선택한
//   loanX 또는 loanO)에서 가져온다 — 대출 여부는 POST /goals 요청 스키마에 별도 필드가
//   없어(CLAUDE.md 2번 API 목록 기준) 저장하지 않고, 선택한 plan의 금액/시점/저축액만
//   반영한다. 인자를 생략하면 기존처럼 loanX(대출 없이) 기준으로 동작한다.
// - targetRentMiddleAmount: condition.marketMedianAmount (백엔드 @NotNull)
export function toGoalCreationPayload(recommendation, plan = recommendation.loanX) {
  const { condition } = recommendation
  const isWolse = condition.dealType === 'WOLSE' && condition.monthlyRent > 0

  return {
    regionCode: condition.regionCode,
    propertyType: condition.housingType,
    tradeType: condition.dealType,
    sizeMin: condition.areaMin,
    sizeMax: condition.areaMax,
    depositMin: condition.depositMin,
    depositMax: condition.depositMax,
    monthlyRentMin: isWolse ? condition.monthlyRent : null,
    monthlyRentMax: isWolse ? condition.monthlyRent : null,
    targetDate: plan.targetDate,
    targetAmount: plan.targetAmount,
    targetRentMiddleAmount: condition.marketMedianAmount,
    monthlySavings: plan.monthlySaving,
  }
}
