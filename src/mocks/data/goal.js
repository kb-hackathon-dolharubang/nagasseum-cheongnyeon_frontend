import { SIDO_LIST, GUGUN_BY_SIDO, findRegionBySigunguCode } from '@/shared/constants/regions'

import { SEED_ASSET_SUMMARY, SEED_GOAL } from '@/mocks/data/seed'

// "현재 인식 자산"은 asset 도메인의 SEED_ASSET_SUMMARY.totalAssets를 그대로 쓴다(자산 요약
// 화면에 보이는 총자산과 같은 숫자여야 진단 결과의 "이미 가진 돈"이 의미가 있다).
const MOCK_RECOGNIZED_ASSETS = SEED_ASSET_SUMMARY.totalAssets

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

// 대출 옵션별 forecasts를 계산한다. FIXED 기준일이 이 대출을 썼을 때의 "현재 목표" 기준점이 되고,
// RECENT_AVERAGE/LATEST의 monthsDiff는 그 FIXED 기준일보다 몇 개월 이른지(양수) 늦은지(음수)를 뜻한다
// (SavingForecastCard가 이 monthsDiff로 타임라인 위치와 "앞당겨졌어요" 문구를 그린다).
function buildLoanOptionForecasts(remainingAmount) {
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
      remainingAmount <= 0
        ? null
        : addMonths(now, Math.max(Math.ceil(remainingAmount / monthlySaving), 1)),
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
    forecasts: buildLoanOptionForecasts(remainingAmount),
  }
}

// 목표 상세화면 "대출 활용" 토글에 쓰는 대출 옵션 3종. 진단 결과 mock(buildMockRecommendationResult)의
// policyId/productName/eligible/ineligibleReason 명명을 그대로 따른다.
const GOAL_LOAN_OPTIONS_META = [
  {
    policyId: 'beotimmok-jeonse',
    productName: '청년전용 버팀목전세자금대출',
    eligible: true,
    ineligibleReason: null,
    loanAmount: 80000000,
  },
  {
    policyId: 'didimdol-jeonse',
    productName: '디딤돌 전세대출',
    eligible: false,
    ineligibleReason: '부부합산 순자산 기준을 초과해 이 대출은 받기 어려워요.',
    loanAmount: null,
  },
  {
    policyId: 'bank-general-jeonse',
    productName: '은행 일반 전세자금대출',
    eligible: true,
    ineligibleReason: null,
    loanAmount: 60000000,
  },
]

function buildGoalLoanOptions() {
  return GOAL_LOAN_OPTIONS_META.map(({ eligible, loanAmount, ...meta }) => ({
    ...meta,
    eligible,
    loanAmount,
    ...(eligible ? buildLoanOptionPlan(loanAmount) : { progress: null, forecasts: null }),
  }))
}

// POST /api/v1/goals mock 저장 응답 — 실제 DB 저장 없이 성공 응답만 흉내낸다.
export const mockGoalSaveResponse = { goalId: SEED_GOAL.id }

// GET /api/v1/goals/{goalId}/detail 응답 mock ("목표 달성 상세 조회" API 명세 기준).
// 저축 기록이 3건 미만이면 forecasts에서 RECENT_AVERAGE가, 0건이면 FIXED 외 항목이 모두 빠진다.
// 필드 전부가 SEED_GOAL에서 나오므로, 홈 화면 요약(mockGoalSummaryHome)과 항상 같은 목표를 가리킨다.
export const mockGoalDetail = {
  goalId: SEED_GOAL.id,
  goalType: SEED_GOAL.goalType,
  status: SEED_GOAL.status,
  housing: {
    regionCode: SEED_GOAL.housing.regionCode,
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
  forecasts: [
    {
      basis: 'FIXED',
      monthlySaving: SEED_GOAL.monthlySaving,
      expectedDate: SEED_GOAL.targetDate,
      monthsDiff: 0,
    },
    {
      basis: 'RECENT_AVERAGE',
      monthlySaving: SEED_GOAL.savingHistory.recentAverageSaving,
      expectedDate: '2028-04-30',
      monthsDiff: 5,
    },
    {
      basis: 'LATEST',
      monthlySaving: SEED_GOAL.savingHistory.latestSaving,
      expectedDate: '2028-02-29',
      monthsDiff: 7,
    },
  ],
  // 목표 상세화면 "대출 활용" 토글용 — 각 옵션의 progress/forecasts는 위 progress/forecasts와
  // 같은 shape이라 GoalProgressCard/SavingForecastCard가 그대로 재사용된다.
  loanOptions: buildGoalLoanOptions(),
}

// GET /api/v1/goals/{goalId} 응답 mock ("목표 조회" API 명세 기준).
// 생성·수정 요청 본문과 같은 평평한 GoalResponse다. 수정 폼 재현용이라 지역은 이름이 아니라
// 코드(regionCode)로 내려오고, 전세라 월세는 null이 아니라 0으로 정규화된 값이 온다.
// targetDate는 날짜가 아니라 YYYY-MM이다.
export const mockGoal = {
  goalId: SEED_GOAL.id,
  status: SEED_GOAL.status,
  regionCode: SEED_GOAL.housing.regionCode,
  propertyType: mockGoalDetail.housing.housingType,
  tradeType: mockGoalDetail.housing.dealType,
  sizeMin: mockGoalDetail.housing.areaMin,
  sizeMax: mockGoalDetail.housing.areaMax,
  depositMin: mockGoalDetail.housing.depositMin,
  depositMax: mockGoalDetail.housing.depositMax,
  monthlyRentMin: 0,
  monthlyRentMax: 0,
  monthlySavings: mockGoalDetail.savingStatus.fixedSaving,
  targetDate: mockGoalDetail.targetDate.slice(0, 7),
  targetAmount: mockGoalDetail.progress.targetAmount,
  targetRentMiddleAmount: 350000000,
  createdAt: SEED_GOAL.createdAt,
  updatedAt: SEED_GOAL.updatedAt,
}

// GET /api/v1/goals/{goalId}/simulations/monthly-saving 응답 mock.
// 예상 달성 시점 계산은 백엔드 몫이므로 목에서도 계산하지 않고 고정 응답만 둔다.
// 여기 없는 금액은 준비된 목 데이터가 없다는 뜻이며, 실제 API가 붙으면 임의 금액도 모두 계산된다.
// 필드는 목표 달성 상세 조회의 forecasts[] 항목과 동일한 형태.
export const mockSavingSimulations = {
  550000: { basis: 'CUSTOM', monthlySaving: 550000, expectedDate: '2028-07-31', monthsDiff: 2 },
}

// PUT /api/v1/goals/{goalId} 는 아직 백엔드 구현 전이라, 목 핸들러가 위 두 fixture의 월 저축액을
// 메모리에서 갱신해 준다. 수정 직후 화면 이동 시 바뀐 값이 보이게 하려는 것이며,
// 브라우저를 새로고침하면 모듈이 다시 로드되어 초기값으로 돌아온다.
export function applyMockGoalUpdate({ monthlySavings }) {
  mockGoal.monthlySavings = monthlySavings
  mockGoalDetail.savingStatus.fixedSaving = monthlySavings

  const fixedForecast = mockGoalDetail.forecasts.find((forecast) => forecast.basis === 'FIXED')
  if (fixedForecast) fixedForecast.monthlySaving = monthlySavings
}

// GET /api/v1/goals/market-trend 응답 mock (API 명세서 예시값 그대로)
// initialMiddleAmount는 "설정 당시 중앙값"이 아니라 "진단 당시 몬테카를로로 예측한
// predictionTargetYm 시점 시세(P50)"다. currentMiddleAmount(현재 실거래 중앙값)와는
// 기준 시점이 다르므로 두 값을 직접 비교/차감하지 않는다.
// predictionTargetYm은 목표(goal.targetDate) 시점 정보라 최신 예측 성공 여부와 무관하게
// 항상 내려온다(null 아님). 최신 예측이 실패하면 latestPredictedMarketAmount /
// predictionChangeAmount만 null이 된다.
export const mockGoalMarketTrend = {
  regionName: SEED_GOAL.housing.regionName,
  housingType: SEED_GOAL.housing.housingType,
  dealType: SEED_GOAL.housing.dealType,
  areaMin: SEED_GOAL.housing.areaMin,
  areaMax: SEED_GOAL.housing.areaMax,
  updatedYm: '2026-07',
  currentMiddleAmount: 95000000,
  predictionTargetYm: '2027-08',
  initialMiddleAmount: 100000000,
  latestPredictedMarketAmount: 105000000,
  predictionChangeAmount: 5000000,
  targetAmount: SEED_GOAL.targetAmount,
  maintainEta: '2027-08',
  reflectEta: '2027-03',
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
  targetDate: SEED_GOAL.targetDate.slice(0, 7),
  progress: {
    currentAmount: SEED_GOAL.progress.currentAmount,
    remainingAmount: SEED_GOAL.progress.remainingAmount,
    achievementRate: SEED_GOAL.progress.achievementRate,
    remainingMonths: Math.max(monthsBetween(currentYm(), SEED_GOAL.targetDate.slice(0, 7)), 0),
  },
}

// 활성 목표가 없을 때(GOAL_001) 흐름 확인용
export const mockGoalNotFoundResponse = {
  success: false,
  data: null,
  error: { code: 'GOAL_001', message: '활성 목표를 찾을 수 없습니다.' },
}
const PYEONG_TO_M2 = 3.3058

const MOCK_RECOMMENDATION_MEDIAN = {
  JEONSE: 350000000,
  WOLSE: 50000000,
}

function resolveRegionName(regionCode) {
  if (!regionCode) return ''
  if (regionCode.length === 2) {
    return SIDO_LIST.find((sido) => sido.code === regionCode)?.name ?? ''
  }
  const region = findRegionBySigunguCode(regionCode)
  return region ? `${region.sidoName} ${region.sigunguName}` : ''
}

function buildRecommendationCondition(payload, overrides = {}) {
  const dealType = overrides.dealType ?? payload.tradeType ?? 'JEONSE'
  const sizeMin = overrides.sizeMin ?? payload.sizeMin ?? 15
  const sizeMax = overrides.sizeMax ?? payload.sizeMax ?? 19
  const regionCode = overrides.regionCode ?? payload.regionCode

  return {
    regionCode,
    regionName: resolveRegionName(regionCode),
    housingType: overrides.housingType ?? payload.propertyType ?? 'APT',
    dealType,
    // 요청은 평, 응답은 전용면적 ㎡ 기준이라 여기서 환산한다.
    areaMin: Math.round(sizeMin * PYEONG_TO_M2),
    areaMax: Math.round(sizeMax * PYEONG_TO_M2),
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
    sampleCount: overrides.sampleCount ?? 142,
  }
}

function buildPlans(median, monthlySaving, loanAmount) {
  const ownFundsWithoutLoan = Math.max(median - MOCK_RECOGNIZED_ASSETS, 0)
  const ownFundsWithLoan = Math.max(ownFundsWithoutLoan - loanAmount, 0)
  const monthsWithoutLoan = Math.max(Math.ceil(ownFundsWithoutLoan / monthlySaving), 1)
  const monthsWithLoan = Math.max(Math.ceil(ownFundsWithLoan / monthlySaving), 1)

  return {
    loanX: {
      targetAmount: ownFundsWithoutLoan,
      targetDate: addMonths(currentYm(), monthsWithoutLoan),
      monthlySaving,
    },
    loanO: {
      loanAmount,
      targetAmount: ownFundsWithLoan,
      targetDate: addMonths(currentYm(), monthsWithLoan),
      monthlySaving,
    },
  }
}

export function buildMockRecommendations(payload) {
  const monthlySaving = 1000000
  const dealType = payload.tradeType ?? 'JEONSE'
  const median = MOCK_RECOMMENDATION_MEDIAN[dealType] ?? MOCK_RECOMMENDATION_MEDIAN.JEONSE

  // 시도 2자리로 요청하면 REALISTIC은 시군구까지 좁혀서 답한다. 목 데이터에는 실거래가 없으니
  // 그 시도의 첫 번째 구/군을 골라 "좁혀졌다"는 것만 재현한다.
  const firstGugun = GUGUN_BY_SIDO[payload.regionCode?.slice(0, 2)]?.[0]?.code
  const realisticRegionCode =
    payload.regionCode?.length === 2 && firstGugun ? firstGugun : payload.regionCode

  return {
    recommendations: [
      {
        type: 'PREFERENCE',
        title: '내가 원하는 조건 그대로',
        reason: `선택하신 ${resolveRegionName(payload.regionCode)} 조건의 최근 실거래 중앙값이에요.`,
        condition: buildRecommendationCondition(payload),
        ...buildPlans(median, monthlySaving, 80000000),
      },
      {
        type: 'REALISTIC',
        title: '지금 소득으로 현실적인 선택',
        reason: '현재 소득 수준에서 10년 안에 도달할 수 있는 조건을 찾았어요.',
        condition: buildRecommendationCondition(payload, {
          regionCode: realisticRegionCode,
          sampleCount: 389,
        }),
        ...buildPlans(roundTo(median * 0.62, 1000000), monthlySaving, 70000000),
      },
      {
        type: 'HOLD_OUT',
        title: '조금 더 모으면 갈 수 있는 곳',
        reason: '조건을 그대로 두고 시점만 늘렸을 때 도달 가능한 목표예요.',
        condition: buildRecommendationCondition(payload, {
          sizeMin: (payload.sizeMin ?? 15) + 5,
          sizeMax: (payload.sizeMax ?? 19) + 5,
          sampleCount: 76,
        }),
        ...buildPlans(roundTo(median * 1.35, 1000000), monthlySaving, 90000000),
      },
    ],
  }
}

export function buildMockRecommendationResult() {
  return {
    originalPreference: {
      condition: {
        regionCode: '11290',
        regionName: '서울특별시 성북구',
        housingType: 'APT',
        dealType: 'JEONSE',
        areaMin: null,
        areaMax: null,
        depositMin: null,
        depositMax: null,
        monthlyRentMin: null,
        monthlyRentMax: null,
      },
      targetDate: '2031-08',
      monthlySaving: 500000,
    },
    recommendations: [
      {
        type: 'PREFERENCE_SAVING_FIXED',
        condition: {
          regionCode: '11290',
          regionName: '서울특별시 성북구',
          housingType: 'APT',
          dealType: 'JEONSE',
          areaMin: 15,
          areaMax: 19,
          depositMin: 0,
          depositMax: 100000000000,
          monthlyRent: 0,
          sampleCount: 814,
          marketMedianAmount: 632104997,
        },
        loanX: {
          targetAmount: 650000000,
          targetDate: '2051-08',
          monthlySaving: 500000,
        },
        loans: [
          {
            policyId: 'beotimmok-jeonse',
            productName: '청년전용 버팀목전세자금대출',
            eligible: true,
            ineligibleReason: null,
            plan: {
              loanAmount: 80000000,
              targetAmount: 570000000,
              targetDate: '2044-12',
              monthlySaving: 500000,
            },
            aiGuide:
              '이 대출은 혼인 여부에 따라 한도가 달라질 수 있어요. 실제 신청 전 취급 은행에서 직접 확인해보세요.',
          },
          {
            policyId: 'didimdol-jeonse',
            productName: '디딤돌 전세대출',
            eligible: false,
            ineligibleReason: '부부합산 순자산 기준을 초과해 이 대출은 받기 어려워요.',
            plan: null,
            aiGuide: null,
          },
          {
            policyId: 'bank-general-jeonse',
            productName: '은행 일반 전세자금대출',
            eligible: true,
            ineligibleReason: null,
            plan: {
              loanAmount: 120000000,
              targetAmount: 530000000,
              targetDate: '2041-02',
              monthlySaving: 500000,
            },
            aiGuide: null,
          },
        ],
      },
      {
        type: 'PREFERENCE_DATE_FIXED',
        condition: {
          regionCode: '11290',
          regionName: '서울특별시 성북구',
          housingType: 'APT',
          dealType: 'JEONSE',
          areaMin: 15,
          areaMax: 19,
          depositMin: 0,
          depositMax: 100000000000,
          monthlyRent: 0,
          sampleCount: 814,
          marketMedianAmount: 632104997,
        },
        loanX: {
          targetAmount: 650000000,
          targetDate: '2031-08',
          monthlySaving: 5200000,
        },
        loans: [
          {
            policyId: 'beotimmok-jeonse',
            productName: '청년전용 버팀목전세자금대출',
            eligible: true,
            ineligibleReason: null,
            plan: {
              loanAmount: 80000000,
              targetAmount: 570000000,
              targetDate: '2031-08',
              monthlySaving: 3900000,
            },
            aiGuide:
              '이 대출은 혼인 여부에 따라 한도가 달라질 수 있어요. 실제 신청 전 취급 은행에서 직접 확인해보세요.',
          },
          {
            policyId: 'didimdol-jeonse',
            productName: '디딤돌 전세대출',
            eligible: true,
            ineligibleReason: null,
            plan: {
              loanAmount: 100000000,
              targetAmount: 550000000,
              targetDate: '2031-08',
              monthlySaving: 3600000,
            },
            aiGuide: '이 대출은 생애최초 주택 구입 여부에 따라 한도가 달라질 수 있어요.',
          },
          {
            policyId: 'bank-general-jeonse',
            productName: '은행 일반 전세자금대출',
            eligible: true,
            ineligibleReason: null,
            plan: {
              loanAmount: 60000000,
              targetAmount: 590000000,
              targetDate: '2031-08',
              monthlySaving: 4500000,
            },
            aiGuide: null,
          },
        ],
      },
      {
        type: 'REALISTIC',
        condition: {
          regionCode: '11290',
          regionName: '서울특별시 성북구',
          housingType: 'APT',
          dealType: 'JEONSE',
          areaMin: 4,
          areaMax: 9,
          depositMin: 0,
          depositMax: 100000000000,
          monthlyRent: 0,
          sampleCount: 5,
          marketMedianAmount: 170000000,
        },
        loanX: {
          targetAmount: 185000000,
          targetDate: '2028-08',
          monthlySaving: 0,
        },
        loans: [
          {
            policyId: 'beotimmok-jeonse',
            productName: '청년전용 버팀목전세자금대출',
            eligible: false,
            ineligibleReason: '세대주가 아니어서 이 대출 대상에 해당하지 않아요.',
            plan: null,
            aiGuide: null,
          },
          {
            policyId: 'didimdol-jeonse',
            productName: '디딤돌 전세대출',
            eligible: false,
            ineligibleReason: '디딤돌 전세대출은 무주택 세대주만 신청할 수 있어요.',
            plan: null,
            aiGuide: null,
          },
          {
            policyId: 'bank-general-jeonse',
            productName: '은행 일반 전세자금대출',
            eligible: true,
            ineligibleReason: null,
            plan: {
              loanAmount: 70000000,
              targetAmount: 115000000,
              targetDate: '2027-02',
              monthlySaving: 0,
            },
            aiGuide: null,
          },
        ],
      },
      {
        type: 'HOLD_OUT',
        condition: {
          regionCode: '11290',
          regionName: '서울특별시 성북구',
          housingType: 'APT',
          dealType: 'JEONSE',
          areaMin: 10,
          areaMax: 14,
          depositMin: 0,
          depositMax: 100000000000,
          monthlyRent: 0,
          sampleCount: 91,
          marketMedianAmount: 262500000,
        },
        loanX: {
          targetAmount: 280000000,
          targetDate: '2030-08',
          monthlySaving: 500000,
        },
        loans: [
          {
            policyId: 'beotimmok-jeonse',
            productName: '청년전용 버팀목전세자금대출',
            eligible: true,
            ineligibleReason: null,
            plan: {
              loanAmount: 80000000,
              targetAmount: 200000000,
              targetDate: '2028-10',
              monthlySaving: 500000,
            },
            aiGuide:
              '이 대출은 혼인 여부에 따라 한도가 달라질 수 있어요. 실제 신청 전 취급 은행에서 직접 확인해보세요.',
          },
          {
            policyId: 'didimdol-jeonse',
            productName: '디딤돌 전세대출',
            eligible: true,
            ineligibleReason: null,
            plan: {
              loanAmount: 90000000,
              targetAmount: 190000000,
              targetDate: '2028-06',
              monthlySaving: 500000,
            },
            aiGuide: '이 대출은 생애최초 주택 구입 여부에 따라 한도가 달라질 수 있어요.',
          },
          {
            policyId: 'bank-general-jeonse',
            productName: '은행 일반 전세자금대출',
            eligible: true,
            ineligibleReason: null,
            plan: {
              loanAmount: 50000000,
              targetAmount: 230000000,
              targetDate: '2029-04',
              monthlySaving: 500000,
            },
            aiGuide: null,
          },
        ],
      },
    ],
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
