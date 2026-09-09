import { SIDO_LIST, GUGUN_BY_SIDO, findRegionBySigunguCode } from '@/shared/constants/regions'

import {
  SEED_AVAILABLE_FUNDS,
  SEED_GOAL,
  SEED_LOAN_PRODUCTS,
  SEED_MARKET,
  loanEligibility,
  loanLimitFor,
} from '@/mocks/data/seed'

function currentYm() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function monthsBetween(fromYm, toYm) {
  const [fy, fm] = fromYm.split('-').map(Number)
  const [ty, tm] = toYm.split('-').map(Number)
  return (ty - fy) * 12 + (tm - fm)
}

function addMonths(ym, delta) {
  const [y, m] = ym.split('-').map(Number)
  const total = y * 12 + (m - 1) + delta
  const newY = Math.floor(total / 12)
  const newM = (total % 12) + 1
  return `${newY}-${String(newM).padStart(2, '0')}`
}

function roundTo(amount, unit) {
  return Math.round(amount / unit) * unit
}

// 목표 시점을 못 박았을 때 필요한 월 저축액. 모자라면 안 되므로 만원 단위로 올림한다.
function ceilTo(amount, unit) {
  return Math.ceil(amount / unit) * unit
}

const TARGET_YM = SEED_GOAL.targetDate.slice(0, 7)

// 지금부터 remainingAmount를 monthlySaving으로 모으는 데 걸리는 개월 수.
function monthsToSave(remainingAmount, monthlySaving) {
  if (remainingAmount <= 0) return 0
  return Math.max(Math.ceil(remainingAmount / monthlySaving), 1)
}

// 기준별 forecasts를 계산한다. FIXED 기준일이 "현재 목표" 기준점이 되고, RECENT_AVERAGE/LATEST의
// monthsDiff는 그 FIXED 기준일보다 몇 개월 이른지(양수) 늦은지(음수)를 뜻한다
// (SavingForecastCard가 이 monthsDiff로 타임라인 위치와 "앞당겨졌어요" 문구를 그린다).
//
// 날짜를 고정값으로 적어두지 않고 매번 계산하는 이유는, 시드의 저축액·목표 금액을 바꿨을 때
// forecasts만 옛날 숫자로 남아 화면끼리 어긋나는 일을 막기 위해서다.
function buildForecasts(remainingAmount) {
  const bases = [
    { basis: 'FIXED', monthlySaving: SEED_GOAL.monthlySaving },
    { basis: 'RECENT_AVERAGE', monthlySaving: SEED_GOAL.savingHistory.recentAverageSaving },
    { basis: 'LATEST', monthlySaving: SEED_GOAL.savingHistory.latestSaving },
  ]

  const now = currentYm()
  const dated = bases.map(({ basis, monthlySaving }) => ({
    basis,
    monthlySaving,
    // 남은 금액이 0이면 이미 달성한 상태라 expectedDate가 null로 내려온다(SavingForecastCard 관례).
    expectedDate:
      remainingAmount <= 0 ? null : addMonths(now, monthsToSave(remainingAmount, monthlySaving)),
  }))

  const fixedDate = dated.find((forecast) => forecast.basis === 'FIXED').expectedDate

  return dated.map((forecast) => ({
    ...forecast,
    monthsDiff:
      forecast.basis === 'FIXED' || !forecast.expectedDate || !fixedDate
        ? 0
        : monthsBetween(forecast.expectedDate, fixedDate),
  }))
}

// 대출을 활용하면 필요한 자기자금(targetAmount)이 대출금만큼 줄어든다. currentAmount는 실제로
// 모아둔 돈이라 대출 여부와 무관하게 그대로다.
function buildLoanOptionPlan(loanAmount) {
  const targetAmount = Math.max(SEED_GOAL.targetAmount - loanAmount, 0)
  const currentAmount = SEED_GOAL.progress.currentAmount
  const remainingAmount = Math.max(targetAmount - currentAmount, 0)
  const achievementRate =
    targetAmount > 0 ? Math.min(Math.round((currentAmount / targetAmount) * 100), 100) : 100

  return {
    progress: { targetAmount, currentAmount, remainingAmount, achievementRate },
    forecasts: buildForecasts(remainingAmount),
  }
}

// 목표 상세화면 "대출 활용" 토글에 쓰는 대출 옵션 3종. 이 토글은 적격 심사 화면이 아니라
// "이 대출을 끼면 저축 계획이 어떻게 바뀌나"를 보여주는 곳이라, 진단 결과의 EligibilityResult
// (coreFindings/advice)와 달리 policyId/productName/eligible/ineligibleReason 단순 구조를 쓴다.
// 상품과 한도는 SEED_LOAN_PRODUCTS에서 가져오므로 진단 결과의 loans[]와 같은 상품을 가리킨다.
// eligibilityChecklist(met/not_met/needs_verification)는 이 화면 전용 자격요건 목록이다.
function buildGoalLoanOptions() {
  return SEED_LOAN_PRODUCTS.map((product) => {
    const eligible = loanEligibility(product)
    const loanAmount = eligible ? loanLimitFor(product, SEED_GOAL.targetAmount) : null

    return {
      policyId: product.policyId,
      productName: product.productName,
      eligible,
      // 못 받는 이유는 문장이 아니라 아래 체크리스트의 not_met 항목이 들고 있다.
      ineligibleReason: null,
      eligibilityChecklist: product.eligibilityChecklist,
      loanAmount,
      ...(eligible ? buildLoanOptionPlan(loanAmount) : { progress: null, forecasts: null }),
    }
  })
}

// POST /api/v1/goals mock 저장 응답 — 실제 DB 저장 없이 성공 응답만 흉내낸다.
export const mockGoalSaveResponse = { goalId: SEED_GOAL.id }

// GET /api/v1/goals/{goalId}/detail 응답 mock ("목표 달성 상세 조회" API 명세 기준).
// 저축 기록이 3건 미만이면 forecasts에서 RECENT_AVERAGE가, 0건이면 FIXED 외 항목이 모두 빠진다.
// 필드 전부가 SEED_GOAL에서 나오므로, 홈 화면 요약(mockGoalSummaryHome)과 항상 같은 목표를 가리킨다.
//
// targetAmount는 대출을 반영하지 않은 전세보증금 전액(시세 1.8억)이다. 월 70만원만으로는 도달이
// 한참 뒤라 forecasts가 먼 미래를 가리키는데, 이게 정상이다 — "대출 활용" 토글(loanOptions)을
// 켜야 비로소 목표 시점 근처로 들어오는 것이 이 페르소나의 핵심 서사다.
export const mockGoalDetail = {
  goalId: SEED_GOAL.id,
  goalType: SEED_GOAL.goalType,
  status: SEED_GOAL.status,
  housing: {
    regionCode: SEED_GOAL.housing.regionCode,
    dongCode: SEED_GOAL.housing.dongCode,
    housingType: SEED_GOAL.housing.housingType,
    dealType: SEED_GOAL.housing.dealType,
    areaMin: SEED_GOAL.housing.areaMin,
    areaMax: SEED_GOAL.housing.areaMax,
    depositMin: SEED_GOAL.housing.depositMin,
    depositMax: SEED_GOAL.housing.depositMax,
  },
  targetDate: SEED_GOAL.targetDate,
  progress: {
    targetAmount: SEED_GOAL.targetAmount,
    currentAmount: SEED_GOAL.progress.currentAmount,
    remainingAmount: SEED_GOAL.progress.remainingAmount,
    achievementRate: SEED_GOAL.progress.achievementRate,
  },
  savingStatus: {
    fixedSaving: SEED_GOAL.monthlySaving,
    recentAverageSaving: SEED_GOAL.savingHistory.recentAverageSaving,
    latestSaving: SEED_GOAL.savingHistory.latestSaving,
  },
  forecasts: buildForecasts(SEED_GOAL.progress.remainingAmount),
  // 목표 상세화면 "대출 활용" 토글용 — 각 옵션의 progress/forecasts는 위 progress/forecasts와
  // 같은 shape이라 GoalProgressCard/SavingForecastCard가 그대로 재사용된다.
  loanOptions: buildGoalLoanOptions(),
}

// GET /api/v1/goals/{goalId} 응답 mock ("목표 조회" API 명세 기준).
// 생성·수정 요청 본문과 같은 평평한 GoalResponse다. 수정 폼 재현용이라 지역은 이름이 아니라
// 코드(regionCode/dongCode)로 내려오고, 전세라 월세는 null이 아니라 0으로 정규화된 값이 온다.
// targetDate는 날짜가 아니라 YYYY-MM이다.
export const mockGoal = {
  goalId: SEED_GOAL.id,
  status: SEED_GOAL.status,
  regionCode: SEED_GOAL.housing.regionCode,
  // 진단에서 봉천동까지 골랐으므로 수정 폼도 동 선택이 채워진 상태로 열려야 한다.
  dongCode: SEED_GOAL.housing.dongCode,
  propertyType: SEED_GOAL.housing.housingType,
  tradeType: SEED_GOAL.housing.dealType,
  sizeMin: SEED_GOAL.housing.areaMin,
  sizeMax: SEED_GOAL.housing.areaMax,
  depositMin: SEED_GOAL.housing.depositMin,
  depositMax: SEED_GOAL.housing.depositMax,
  monthlyRentMin: 0,
  monthlyRentMax: 0,
  monthlySavings: SEED_GOAL.monthlySaving,
  targetDate: TARGET_YM,
  targetAmount: SEED_GOAL.targetAmount,
  targetRentMiddleAmount: SEED_MARKET.middleAmount,
  createdAt: SEED_GOAL.createdAt,
  updatedAt: SEED_GOAL.updatedAt,
}

// GET /api/v1/goals/{goalId}/simulations/monthly-saving 응답 mock.
// 여기 없는 금액은 준비된 목 데이터가 없다는 뜻이며, 실제 API가 붙으면 임의 금액도 모두 계산된다.
// 필드는 목표 달성 상세 조회의 forecasts[] 항목과 동일한 형태다. 시드 값이 바뀌어도 어긋나지
// 않도록 금액 목록만 두고 예상 시점은 forecasts와 같은 방식으로 계산한다.
const SIMULATION_AMOUNTS = [900000, 1200000, 1500000]

export const mockSavingSimulations = Object.fromEntries(
  SIMULATION_AMOUNTS.map((monthlySaving) => {
    const remaining = SEED_GOAL.progress.remainingAmount
    const expectedDate = addMonths(currentYm(), monthsToSave(remaining, monthlySaving))
    const fixedDate = addMonths(currentYm(), monthsToSave(remaining, SEED_GOAL.monthlySaving))

    return [
      monthlySaving,
      {
        basis: 'CUSTOM',
        monthlySaving,
        expectedDate,
        monthsDiff: monthsBetween(expectedDate, fixedDate),
      },
    ]
  }),
)

// PUT /api/v1/goals/{goalId} 는 아직 백엔드 구현 전이라, 목 핸들러가 위 두 fixture의 월 저축액을
// 메모리에서 갱신해 준다. 수정 직후 화면 이동 시 바뀐 값이 보이게 하려는 것이며,
// 브라우저를 새로고침하면 모듈이 다시 로드되어 초기값으로 돌아온다.
export function applyMockGoalUpdate({ monthlySavings }) {
  mockGoal.monthlySavings = monthlySavings
  mockGoalDetail.savingStatus.fixedSaving = monthlySavings

  const fixedForecast = mockGoalDetail.forecasts.find((forecast) => forecast.basis === 'FIXED')
  if (fixedForecast) fixedForecast.monthlySaving = monthlySavings
}

// GET /api/v1/goals/market-trend 응답 mock
// initialMiddleAmount는 "설정 당시 중앙값"이 아니라 "진단 당시 몬테카를로로 예측한
// predictionTargetYm 시점 시세(P50)"다. currentMiddleAmount(현재 실거래 중앙값)와는
// 기준 시점이 다르므로 두 값을 직접 비교/차감하지 않는다.
// predictionTargetYm은 목표(goal.targetDate) 시점 정보라 최신 예측 성공 여부와 무관하게
// 항상 내려온다(null 아님). 최신 예측이 실패하면 latestPredictedMarketAmount /
// predictionChangeAmount만 null이 된다.
export const mockGoalMarketTrend = {
  regionName: SEED_MARKET.regionName,
  housingType: SEED_MARKET.housingType,
  dealType: SEED_MARKET.dealType,
  areaMin: SEED_MARKET.areaMin,
  areaMax: SEED_MARKET.areaMax,
  updatedYm: '2026-08',
  currentMiddleAmount: SEED_MARKET.middleAmount,
  predictionTargetYm: TARGET_YM,
  initialMiddleAmount: 192000000,
  latestPredictedMarketAmount: 198500000,
  predictionChangeAmount: 6500000,
  targetAmount: SEED_GOAL.targetAmount,
  maintainEta: '2030-08',
  reflectEta: '2031-02',
}

// GET /api/v1/goals/active 응답 mock ("활성 목표 조회" API 명세 기준)
export const mockActiveGoal = {
  goalId: mockGoal.goalId,
  goalType: SEED_GOAL.goalType,
  status: SEED_GOAL.status,
  targetAmount: mockGoal.targetAmount,
  targetDate: mockGoal.targetDate,
}

export const mockGoalSummaryHome = {
  goalId: SEED_GOAL.id,
  goalType: SEED_GOAL.goalType,
  housing: {
    regionName: SEED_GOAL.housing.regionName,
    housingType: SEED_GOAL.housing.housingType,
    dealType: SEED_GOAL.housing.dealType,
    areaMin: SEED_GOAL.housing.areaMin,
    areaMax: SEED_GOAL.housing.areaMax,
  },
  targetAmount: SEED_GOAL.targetAmount,
  targetDate: TARGET_YM,
  progress: {
    currentAmount: SEED_GOAL.progress.currentAmount,
    remainingAmount: SEED_GOAL.progress.remainingAmount,
    achievementRate: SEED_GOAL.progress.achievementRate,
    remainingMonths: Math.max(monthsBetween(currentYm(), TARGET_YM), 0),
  },
}

// 활성 목표가 없을 때(GOAL_001) 흐름 확인용
export const mockGoalNotFoundResponse = {
  success: false,
  data: null,
  error: { code: 'GOAL_001', message: '활성 목표를 찾을 수 없습니다.' },
}

// 월세 조건으로 진단했을 때의 보증금 중앙값. 전세는 SEED_MARKET을 그대로 쓴다.
const MOCK_WOLSE_DEPOSIT_MEDIAN = 20000000

function resolveRegionName(regionCode) {
  if (!regionCode) return ''
  if (regionCode.length === 2) {
    return SIDO_LIST.find((sido) => sido.code === regionCode)?.name ?? ''
  }
  const region = findRegionBySigunguCode(regionCode)
  return region ? `${region.sidoName} ${region.sigunguName}` : ''
}

function buildRecommendationCondition(payload, overrides = {}) {
  const dealType = overrides.dealType ?? payload.tradeType ?? SEED_MARKET.dealType
  const sizeMin = overrides.sizeMin ?? payload.sizeMin ?? SEED_MARKET.areaMin
  const sizeMax = overrides.sizeMax ?? payload.sizeMax ?? SEED_MARKET.areaMax
  const regionCode = overrides.regionCode ?? payload.regionCode

  return {
    regionCode,
    regionName: resolveRegionName(regionCode),
    housingType: overrides.housingType ?? payload.propertyType ?? SEED_MARKET.housingType,
    dealType,
    // 화면(recommendationViewModel.toConditionSummary)이 이 값에 그대로 "평"을 붙여 쓰고,
    // 목표 저장 시 sizeMin/sizeMax로 되돌려 보내므로 ㎡로 환산하지 않는다.
    areaMin: sizeMin,
    areaMax: sizeMax,
    // 전세면 0, 월세면 실제 매달 내는 금액. 요청에 월세 범위가 있으면 그 중간값을 쓴다.
    monthlyRent:
      dealType === 'WOLSE'
        ? roundTo(((payload.monthlyRentMin ?? 0) + (payload.monthlyRentMax ?? 800000)) / 2, 10000)
        : 0,
    // 목표 저장 요청이 이 세 값을 그대로 실어 보낸다(모두 백엔드에서 @NotNull이다).
    // GET /goals/recommendation 응답에는 들어 있으므로, 조건 기반 응답에도 같이 둔다.
    depositMin: overrides.depositMin ?? payload.depositMin ?? 0,
    depositMax: overrides.depositMax ?? payload.depositMax ?? 100000000000,
    marketMedianAmount: overrides.marketMedianAmount ?? null,
    sampleCount: overrides.sampleCount ?? SEED_MARKET.sampleCount,
  }
}

function buildPlans(median, monthlySaving, loanAmount) {
  const ownFundsWithoutLoan = Math.max(median - SEED_AVAILABLE_FUNDS, 0)
  const ownFundsWithLoan = Math.max(ownFundsWithoutLoan - loanAmount, 0)

  return {
    loanX: {
      targetAmount: median,
      targetDate: addMonths(currentYm(), monthsToSave(ownFundsWithoutLoan, monthlySaving)),
      monthlySaving,
    },
    loanO: {
      loanAmount,
      targetAmount: Math.max(median - loanAmount, 0),
      targetDate: addMonths(currentYm(), monthsToSave(ownFundsWithLoan, monthlySaving)),
      monthlySaving,
    },
  }
}

export function buildMockRecommendations(payload) {
  const monthlySaving = SEED_GOAL.monthlySaving
  const dealType = payload.tradeType ?? SEED_MARKET.dealType
  const median = dealType === 'WOLSE' ? MOCK_WOLSE_DEPOSIT_MEDIAN : SEED_MARKET.middleAmount
  const beotimmok = SEED_LOAN_PRODUCTS[0]

  // 시도 2자리로 요청하면 REALISTIC은 시군구까지 좁혀서 답한다. 목 데이터에는 실거래가 없으니
  // 그 시도의 첫 번째 구/군을 골라 "좁혀졌다"는 것만 재현한다.
  const firstGugun = GUGUN_BY_SIDO[payload.regionCode?.slice(0, 2)]?.[0]?.code
  const realisticRegionCode =
    payload.regionCode?.length === 2 && firstGugun ? firstGugun : payload.regionCode

  const realisticMedian = roundTo(median * 0.58, 1000000)
  const holdOutMedian = roundTo(median * 1.35, 1000000)

  return {
    recommendations: [
      {
        type: 'PREFERENCE',
        title: '내가 원하는 조건 그대로',
        reason: `선택하신 ${resolveRegionName(payload.regionCode)} 조건의 최근 실거래 중앙값이에요.`,
        condition: buildRecommendationCondition(payload, { marketMedianAmount: median }),
        ...buildPlans(median, monthlySaving, loanLimitFor(beotimmok, median)),
      },
      {
        type: 'REALISTIC',
        title: '지금 소득으로 현실적인 선택',
        reason: '현재 소득 수준에서 10년 안에 도달할 수 있는 조건을 찾았어요.',
        condition: buildRecommendationCondition(payload, {
          regionCode: realisticRegionCode,
          sizeMin: 4,
          sizeMax: 9,
          marketMedianAmount: realisticMedian,
          sampleCount: 63,
        }),
        ...buildPlans(realisticMedian, monthlySaving, loanLimitFor(beotimmok, realisticMedian)),
      },
      {
        type: 'HOLD_OUT',
        title: '조금 더 모으면 갈 수 있는 곳',
        reason: '조건을 그대로 두고 시점만 늘렸을 때 도달 가능한 목표예요.',
        condition: buildRecommendationCondition(payload, {
          sizeMin: (payload.sizeMin ?? SEED_MARKET.areaMin) + 5,
          sizeMax: (payload.sizeMax ?? SEED_MARKET.areaMax) + 5,
          marketMedianAmount: holdOutMedian,
          sampleCount: 88,
        }),
        ...buildPlans(holdOutMedian, monthlySaving, loanLimitFor(beotimmok, holdOutMedian)),
      },
    ],
  }
}

// ── 진단 결과의 추천 4종 (GET /api/v1/goals/recommendation) ──
// 조건만 다르고 계산 방식은 같아서, 조건별 차이만 여기 표로 두고 loanX/loans[]는 아래
// buildRecommendation이 시드(가용 자금·월 저축액·대출 상품)에서 만든다.
//
// - PREFERENCE_SAVING_FIXED: 희망 조건 그대로, 월 저축액을 유지하면 언제 도달하는지
// - PREFERENCE_DATE_FIXED:   희망 조건 그대로, 목표 시점을 지키려면 얼마씩 모아야 하는지
// - REALISTIC:               면적을 줄여 지금 소득으로 닿는 조건
// - HOLD_OUT:                면적을 늘려 조금 더 모으면 닿는 조건
const RECOMMENDATION_SPECS = [
  {
    type: 'PREFERENCE_SAVING_FIXED',
    basis: 'SAVING_FIXED',
    marketMedianAmount: SEED_MARKET.middleAmount,
    areaMin: SEED_MARKET.areaMin,
    areaMax: SEED_MARKET.areaMax,
    sampleCount: SEED_MARKET.sampleCount,
  },
  {
    type: 'PREFERENCE_DATE_FIXED',
    basis: 'DATE_FIXED',
    marketMedianAmount: SEED_MARKET.middleAmount,
    areaMin: SEED_MARKET.areaMin,
    areaMax: SEED_MARKET.areaMax,
    sampleCount: SEED_MARKET.sampleCount,
  },
  {
    type: 'REALISTIC',
    basis: 'SAVING_FIXED',
    // 봉천동 오피스텔 원룸(4~9평) 전세 실거래 중앙값.
    marketMedianAmount: 104500000,
    areaMin: 4,
    areaMax: 9,
    sampleCount: 63,
  },
  {
    type: 'HOLD_OUT',
    basis: 'SAVING_FIXED',
    // 같은 동네에서 방 두 개 이상(15~25평)으로 넓혔을 때의 중앙값.
    marketMedianAmount: 242750000,
    areaMin: 15,
    areaMax: 25,
    sampleCount: 88,
  },
]

// 목표 시점을 지키려면 얼마가 필요한지(DATE_FIXED) / 지금 저축액이면 언제 닿는지(SAVING_FIXED).
// 두 기준 모두 "필요한 자기자금 − 이미 가진 돈"에서 출발하므로 계산을 한곳에 모은다.
function buildPlan(basis, ownFunds) {
  const remaining = Math.max(ownFunds - SEED_AVAILABLE_FUNDS, 0)

  if (basis === 'DATE_FIXED') {
    const months = Math.max(monthsBetween(currentYm(), TARGET_YM), 1)
    return {
      targetAmount: ownFunds,
      targetDate: TARGET_YM,
      monthlySaving: remaining <= 0 ? 0 : ceilTo(remaining / months, 10000),
    }
  }

  return {
    targetAmount: ownFunds,
    targetDate: addMonths(currentYm(), monthsToSave(remaining, SEED_GOAL.monthlySaving)),
    monthlySaving: remaining <= 0 ? 0 : SEED_GOAL.monthlySaving,
  }
}

function buildRecommendation(spec) {
  // 실거래 중앙값은 딱 떨어지지 않으므로, 목표 금액은 백만원 단위로 정리해서 쓴다.
  const depositAmount = roundTo(spec.marketMedianAmount, 1000000)

  return {
    type: spec.type,
    condition: {
      regionCode: SEED_MARKET.regionCode,
      regionName: SEED_MARKET.fullRegionName,
      housingType: SEED_MARKET.housingType,
      dealType: SEED_MARKET.dealType,
      areaMin: spec.areaMin,
      areaMax: spec.areaMax,
      depositMin: 0,
      depositMax: 100000000000,
      monthlyRent: 0,
      sampleCount: spec.sampleCount,
      marketMedianAmount: spec.marketMedianAmount,
    },
    loanX: buildPlan(spec.basis, depositAmount),
    // 적격 심사(coreFindings/advice)는 신청인 속성이라 추천안이 달라져도 같고, plan만 조건에 따라
    // 달라진다. plan은 적격 여부와 무관하게 붙인다 — 계산식은 심사가 아니라 목표 엔진 쪽이다.
    loans: SEED_LOAN_PRODUCTS.map((product) => {
      const loanAmount = loanLimitFor(product, depositAmount)

      return {
        policyId: product.policyId,
        policyName: product.productName,
        coreFindings: product.coreFindings,
        advice: product.advice,
        plan: { loanAmount, ...buildPlan(spec.basis, depositAmount - loanAmount) },
      }
    }),
  }
}

export function buildMockRecommendationResult() {
  return {
    originalPreference: {
      condition: {
        regionCode: SEED_MARKET.regionCode,
        regionName: SEED_MARKET.fullRegionName,
        housingType: SEED_MARKET.housingType,
        dealType: SEED_MARKET.dealType,
        areaMin: SEED_MARKET.areaMin,
        areaMax: SEED_MARKET.areaMax,
        // 진단에서 보증금 범위는 고르지 않았다.
        depositMin: null,
        depositMax: null,
        monthlyRentMin: null,
        monthlyRentMax: null,
      },
      targetDate: TARGET_YM,
      monthlySaving: SEED_GOAL.monthlySaving,
    },
    recommendations: RECOMMENDATION_SPECS.map(buildRecommendation),
  }
}

// 목표 시점을 입력하지 않고 진단한 경우의 응답 mock. 이때는 PREFERENCE_DATE_FIXED
// recommendation 자체가 응답에 없다 — 결과 화면의 "희망 조건을 기준으로" 영역에 카드가 1개만
// 있어도 빈 자리 없이 자연스럽게 이어지는지 확인할 때 쓴다. mockGoalNotFoundResponse와 같은
// 방식으로, 기본으로 연결돼 있지는 않으니 확인하려면 goalHandlers.js의
// GET /goals/recommendation 핸들러에서 buildMockRecommendationResult 대신 이 함수를 임시로
// 호출해보면 된다.
export function buildMockRecommendationResultWithoutDateFixed() {
  const base = buildMockRecommendationResult()
  return {
    originalPreference: { ...base.originalPreference, targetDate: null },
    recommendations: base.recommendations.filter((item) => item.type !== 'PREFERENCE_DATE_FIXED'),
  }
}
