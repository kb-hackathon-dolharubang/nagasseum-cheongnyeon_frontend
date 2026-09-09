import { formatAreaRange, formatGoalAmount, formatYearMonth } from '@/shared/utils/formatter'
import { HOUSING_TYPE_LABEL, DEAL_TYPE_LABEL } from '@/shared/constants/housing'

const TYPE_ORDER = {
  PREFERENCE_SAVING_FIXED: 0,
  PREFERENCE_DATE_FIXED: 1,
  REALISTIC: 2,
  HOLD_OUT: 3,
}

// API의 title을 그대로 쓰지 않고 화면 전용 제목으로 바꾼다.
export const RECOMMENDATION_TITLE_MAP = {
  PREFERENCE_SAVING_FIXED: '지금 저축대로 모으면',
  PREFERENCE_DATE_FIXED: '목표 시점에 맞추려면',
  REALISTIC: '현재 준비 상황을 반영하면',
  HOLD_OUT: '선택의 폭을 넓혀보면',
}

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

export function toOrderedRecommendationList(recommendations) {
  return sortRecommendations(recommendations).filter(isComparableRecommendation)
}

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

function toConditionArea(condition) {
  const areaLabel = formatAreaRange(condition.areaMin, condition.areaMax)

  if (condition.dealType === 'WOLSE' && condition.monthlyRent > 0) {
    return `${areaLabel} · 월 ${formatGoalAmount(condition.monthlyRent)}`
  }
  return areaLabel
}

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
      title: '이 저축액으로 도달하는 시점',
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
      title: '이 시점에 맞추려면 필요한 저축액',
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

// 백엔드(EligibilityResult)는 전체 적격/부적격(verdict)을 주지 않는다. 코드가 판정하는 건 핵심 요건
// (성년·세대주·무주택·소득)뿐이고 순자산·중복대출·신용도 등은 advice 로만 안내되므로, 핵심 요건이
// 모두 PASS 여도 "받을 수 있음"이라고 단정할 수 없다. 요건별 PASS/FAIL/UNKNOWN 을 3-state 로 합친다:
//  - FAIL 이 하나라도 있으면 그 대출은 실제로 못 받으므로 '받을 수 없음' (확정)
//  - FAIL 없고 UNKNOWN 이 있으면 '추가 확인 필요'
//  - 모두 PASS 면 '핵심 요건 충족' (= 기본은 걸리는 게 없음, 나머지는 advice 로 확인)
const ELIGIBILITY_RESULT_META = {
  PASS: { label: '충족', variant: 'mint' },
  FAIL: { label: '불충족', variant: 'point' },
  UNKNOWN: { label: '확인 필요', variant: 'quest' },
}

const ELIGIBILITY_STATUS_META = {
  ELIGIBLE: { label: '핵심 요건 충족', variant: 'mint' },
  INELIGIBLE: { label: '받을 수 없음', variant: 'point' },
  NEEDS_CHECK: { label: '추가 확인 필요', variant: 'quest' },
}

export function deriveEligibilityStatus(coreFindings) {
  const results = (coreFindings ?? []).map((finding) => finding.result)
  if (results.includes('FAIL')) return 'INELIGIBLE'
  if (results.includes('UNKNOWN')) return 'NEEDS_CHECK'
  return 'ELIGIBLE'
}

function toCoreFindingViewModel(finding) {
  const meta = ELIGIBILITY_RESULT_META[finding.result] ?? {
    label: finding.result,
    variant: 'outline',
  }
  return {
    requirement: finding.requirement,
    result: finding.result,
    resultLabel: meta.label,
    resultVariant: meta.variant,
    basis: finding.basis,
  }
}

export function toLoanCardsViewModel(recommendation) {
  const { condition, loanX, loans } = recommendation

  return (loans ?? []).map((loan) => {
    const status = deriveEligibilityStatus(loan.coreFindings)
    const statusMeta = ELIGIBILITY_STATUS_META[status]

    const card = {
      policyId: loan.policyId,
      // 다운스트림(RecommendationLoanTabs·GoalConfirmModal)이 productName 키를 계속 읽으므로 유지한다.
      productName: loan.policyName,
      status,
      statusLabel: statusMeta.label,
      statusVariant: statusMeta.variant,
      // 목표 확정 모달은 "적격일 때만 대출 낀 계획"을 제안한다 → boolean 하나로 좁혀 넘긴다.
      eligible: status === 'ELIGIBLE',
      coreFindings: (loan.coreFindings ?? []).map(toCoreFindingViewModel),
      advice: loan.advice ?? null,
    }

    // plan·계산식은 적격 심사가 아니라 목표 엔진 쪽 데이터다. 적격이고 계획이 있을 때만 붙인다.
    if (status !== 'ELIGIBLE' || !loan.plan) {
      return card
    }

    const { plan } = loan
    const preparedTotal = plan.targetAmount + plan.loanAmount
    const shortfall =
      typeof condition.marketMedianAmount === 'number'
        ? condition.marketMedianAmount - preparedTotal
        : 0

    return {
      ...card,
      plan,
      // PREFERENCE_SAVING_FIXED는 월 저축액이, PREFERENCE_DATE_FIXED는 목표 시점이 애초에
      // 고정된 값이라 대출을 껴도 그 값 자체는 바뀌지 않는다(다른 쪽 값만 바뀐다). 안 바뀐
      // 값까지 화살표로 그리면 실제로 바뀐 것처럼 오해할 수 있어 changed로 구분해둔다.
      delta: {
        monthlySaving: {
          changed: plan.monthlySaving !== loanX.monthlySaving,
          from: formatGoalAmount(loanX.monthlySaving),
          to: formatGoalAmount(plan.monthlySaving),
        },
        targetDate: {
          changed: plan.targetDate !== loanX.targetDate,
          from: formatYearMonth(loanX.targetDate),
          to: formatYearMonth(plan.targetDate),
        },
      },
      calc: {
        ownFundsLabel: formatGoalAmount(plan.targetAmount),
        loanAmountLabel: formatGoalAmount(plan.loanAmount),
        sumLabel: formatGoalAmount(preparedTotal),
        shortfallLabel: shortfall > 0 ? formatGoalAmount(shortfall) : null,
      },
    }
  })
}

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
