// 목 데이터 전체가 이 파일 하나의 페르소나에서 파생된다. 화면끼리 숫자가 어긋나면
// (자산 요약의 총자산 ≠ 목표의 "이미 가진 돈" 같은) 데모에서 바로 티가 나므로,
// 값을 새로 쓰지 말고 여기 시드를 참조하거나 여기서 파생시킨다.
//
// 페르소나: 26세 회사원, 월 소득 310만원(소득 8~9분위), 순자산 2,500만원.
// 서울 관악구 봉천동 오피스텔 전세(10~20평, 시세 1.8억)를 2029-09까지 월 70만원씩 모아 준비한다.

export const SEED_MEMBER = {
  id: 1,
  nickname: '김지우',
  // 또래 비교(compare)의 코호트 연령대(ageRange)가 이 나이를 기준으로 잡힌다.
  age: 26,
  monthlyIncome: 3100000,
  incomeBracket: 'INCOME_DECILE_8_9',
  occupationType: 'OFFICE_WORKER',
}

export const SEED_ASSET_INSTITUTIONS = [
  {
    institutionName: 'KB국민은행',
    assetAccounts: [
      {
        accountType: 'DEPOSIT',
        assetCategory: '현금성자산',
        accountDisplay: '****-**-1234',
        productName: '급여통장',
        currentValue: 3200000,
        valuationAmount: null,
        depositReceived: null,
        valuationPl: null,
        purchaseAmount: null,
        earningsRate: null,
        startDate: '2023-03-02',
        maturityDate: null,
      },
      {
        accountType: 'SUBSCRIPTION',
        assetCategory: '청약',
        accountDisplay: '****-**-3344',
        productName: '주택청약종합저축',
        currentValue: 6800000,
        valuationAmount: null,
        depositReceived: null,
        valuationPl: null,
        purchaseAmount: null,
        earningsRate: null,
        startDate: '2019-04-10',
        maturityDate: null,
      },
    ],
    loanAccounts: [],
  },
  {
    institutionName: '신한은행',
    assetAccounts: [
      {
        accountType: 'SAVINGS',
        assetCategory: '예적금',
        accountDisplay: '****-**-8765',
        productName: '청년희망적금',
        currentValue: 14500000,
        valuationAmount: null,
        depositReceived: null,
        valuationPl: null,
        purchaseAmount: null,
        earningsRate: null,
        startDate: '2025-03-04',
        maturityDate: '2027-03-04',
      },
    ],
    loanAccounts: [],
  },
  {
    institutionName: '미래에셋증권',
    assetAccounts: [
      {
        accountType: 'STOCK',
        assetCategory: '투자자산',
        accountDisplay: '****-**-9900',
        productName: '위탁종합계좌',
        currentValue: null,
        valuationAmount: 5500000,
        depositReceived: 5000000,
        valuationPl: 500000,
        purchaseAmount: 5000000,
        earningsRate: 10.0,
        startDate: '2025-06-16',
        maturityDate: null,
      },
    ],
    loanAccounts: [],
  },
  {
    institutionName: '한국장학재단',
    assetAccounts: [],
    loanAccounts: [
      {
        loanName: '학자금대출',
        accountDisplay: '****-**-4102',
        loanBalance: 5000000,
        startDate: '2021-03-02',
        endDate: '2036-08-31',
      },
    ],
  },
]

// 청약은 예적금처럼 원금이 그대로 쌓이는 계좌라 현금성으로 묶는다. 자산 요약 응답의
// assetBreakdown이 현금성/투자 둘뿐이라, 여기서 빼면 breakdown 합계가 총자산과 어긋난다.
const CASH_ACCOUNT_TYPES = ['DEPOSIT', 'SAVINGS', 'SUBSCRIPTION']
const INVESTMENT_ACCOUNT_TYPES = ['STOCK', 'FUND']

function accountValue(account) {
  return account.currentValue ?? account.valuationAmount ?? 0
}

function flattenAccountsByType(types) {
  return SEED_ASSET_INSTITUTIONS.flatMap((institution) =>
    institution.assetAccounts
      .filter((account) => types.includes(account.accountType))
      .map((account) => ({
        institutionName: institution.institutionName,
        accountType: account.accountType,
        productName: account.productName,
        accountDisplay: account.accountDisplay,
        balance: accountValue(account),
      })),
  )
}

const cashAccounts = flattenAccountsByType(CASH_ACCOUNT_TYPES)
const investmentAccounts = flattenAccountsByType(INVESTMENT_ACCOUNT_TYPES)

const loans = SEED_ASSET_INSTITUTIONS.flatMap((institution) =>
  institution.loanAccounts.map((loan) => ({
    institutionName: institution.institutionName,
    loanName: loan.loanName,
    accountDisplay: loan.accountDisplay,
    loanBalance: loan.loanBalance,
  })),
)

// 수동 자산(현재 거주 보증금)은 일부러 더하지 않는다. 지금 살고 있는 집에 묶여 있어
// 목표에 쓸 수 없는 돈이라, 자산 목록에는 카드로 보이되 총자산 합계에는 잡지 않는다.
const totalAssets = SEED_ASSET_INSTITUTIONS.flatMap(
  (institution) => institution.assetAccounts,
).reduce((sum, account) => sum + accountValue(account), 0)

const loanBalance = loans.reduce((sum, loan) => sum + loan.loanBalance, 0)

export const SEED_ASSET_SUMMARY = {
  totalAssets,
  loanBalance,
  netAssets: totalAssets - loanBalance,
  get monthlySavings() {
    return SEED_GOAL.monthlySaving
  },
  cashAssetsTotal: cashAccounts.reduce((sum, account) => sum + account.balance, 0),
  cashAccounts,
  investmentAssetsTotal: investmentAccounts.reduce((sum, account) => sum + account.balance, 0),
  investmentAccounts,
  loans,
}

export const SEED_MANUAL_ASSETS = [
  {
    id: 1,
    assetType: 'DEPOSIT',
    amount: 25000000,
    createdAt: '2026-08-20T10:00:00+09:00',
    updatedAt: '2026-08-20T10:00:00+09:00',
  },
]

// 목표 달성률·추천 계산의 "이미 가진 돈". 총자산이 아니라 순자산을 쓴다 — 학자금대출은
// 언젠가 갚아야 할 돈이라 전세보증금으로 넣을 수 없다. 수동 자산(거주 보증금)이 총자산에
// 빠져 있으므로 이 값도 자연히 보증금을 제외한 가용 자금이 된다.
export const SEED_AVAILABLE_FUNDS = SEED_ASSET_SUMMARY.netAssets

// 관악구 봉천동 오피스텔 전세(10~20평)의 실거래 중앙값. 목표 금액·시세 카드·추천 조건이
// 모두 이 값을 기준점으로 삼는다.
export const SEED_MARKET = {
  regionCode: '11620',
  regionName: '서울 관악구',
  fullRegionName: '서울특별시 관악구',
  dongCode: '1162010100',
  dongName: '봉천동',
  housingType: 'OFFICETEL',
  dealType: 'JEONSE',
  areaMin: 10,
  areaMax: 20,
  middleAmount: 180000000,
  sampleCount: 217,
}

// 대출 상품 3종. 목표 상세의 "대출 활용" 토글과 진단 결과의 loans[]가 같은 상품을 가리키도록
// 여기서 한 번만 정의한다. limitRatio는 임차보증금 대비 한도 비율, limitAmount는 상품 자체의
// 최대 한도다(둘 중 작은 쪽이 실제 한도).
//
// coreFindings는 진단 결과의 대출 적격 심사(EligibilityResult) 응답 그대로다. 백엔드는 전체
// 적격/부적격을 주지 않고 요건별 PASS/FAIL/UNKNOWN만 주며, 화면이 이걸로 3-state를 파생한다
// (recommendationViewModel.deriveEligibilityStatus). 세 상품이 각각 ELIGIBLE / NEEDS_CHECK /
// INELIGIBLE 하나씩을 만들어, 진단 결과 카드의 세 가지 상태를 모두 확인할 수 있다.
// 요건 판정은 신청인(사람) 속성이라 추천안(주거 시나리오)이 달라져도 값이 같다.
//
// eligibilityChecklist는 목표 상세의 "대출 활용" 토글이 쓰는 자격요건 체크리스트다
// (met / not_met / needs_verification). coreFindings와 같은 사실을 화면에 맞게 짧게 줄인
// 것이라 판정이 서로 어긋나면 안 된다 — PASS는 met, FAIL은 not_met, UNKNOWN은
// needs_verification에 대응한다.
const PERSONA_AGE_BASIS = '만 26세'
const PERSONA_INCOME_BASIS = '37,200,000원'

export const SEED_LOAN_PRODUCTS = [
  {
    policyId: 'beotimmok-jeonse',
    productName: '버팀목 전세자금대출',
    limitRatio: 0.8,
    limitAmount: 200000000,
    coreFindings: [
      { requirement: '성년(민법상 성년)', result: 'PASS', basis: PERSONA_AGE_BASIS },
      { requirement: '세대주 지위', result: 'PASS', basis: '세대주 본인' },
      { requirement: '세대원 전원 무주택', result: 'PASS', basis: '세대원 전원 무주택' },
      { requirement: '소득(기본 5천만원 이하)', result: 'PASS', basis: PERSONA_INCOME_BASIS },
    ],
    eligibilityChecklist: [
      { criteria: '만 19~34세 이하', status: 'met' },
      { criteria: '무주택 세대구성원', status: 'met' },
      { criteria: '연 소득 5천만원 이하', status: 'met' },
      { criteria: '순자산 3.45억 이하', status: 'met' },
    ],
    advice:
      '혼인하면 소득 예외 상한(신혼부부 부부합산 7,500만원)이 적용될 수 있어요. ' +
      '부부합산 순자산 3.45억원(2026년 기준) 이하, 주택도시기금·은행 전세자금/주택담보대출 미이용 조건을 확인해야 하고, ' +
      '연체·신용점수 등 신용도는 취급 은행에서 최종 확인합니다.',
  },
  {
    policyId: 'didimdol',
    productName: '내집마련 디딤돌 대출',
    limitRatio: 0.7,
    limitAmount: 250000000,
    coreFindings: [
      { requirement: '성년(민법상 성년)', result: 'PASS', basis: PERSONA_AGE_BASIS },
      {
        requirement: '세대주 지위',
        result: 'UNKNOWN',
        basis:
          '만 26세 미혼 세대주 — 단독세대주는 대출 제외 대상이나, 직계존·비속(또는 미성년 형제·자매)과 ' +
          '6개월 이상 동거·부양 중이면 가능. 해당 여부 확인 필요',
      },
      { requirement: '세대원 전원 무주택', result: 'PASS', basis: '세대원 전원 무주택' },
      { requirement: '소득(기본 6천만원 이하)', result: 'PASS', basis: PERSONA_INCOME_BASIS },
    ],
    eligibilityChecklist: [
      { criteria: '만 19세 이상', status: 'met' },
      { criteria: '무주택 세대구성원', status: 'met' },
      { criteria: '연 소득 6천만원 이하', status: 'met' },
      { criteria: '세대주 지위(만 30세 미만 단독세대주 제외)', status: 'needs_verification' },
    ],
    advice:
      '만 30세 미만 미혼 세대주는 원칙적으로 제외되지만, 직계존·비속과 6개월 이상 동거·부양 중이면 신청할 수 있어요. ' +
      '내집마련 디딤돌은 주택 구입(매매계약) 자금이며, 부부합산 순자산 5.11억원 이하와 생애최초·자녀 수에 따른 ' +
      '소득 예외 상한(최대 8,500만원)도 함께 확인하세요.',
  },
  {
    // 유일한 FAIL 케이스라 화면이 INELIGIBLE("받을 수 없음")로 그린다. 재직 요건은
    // 희망 조건(보증금·면적)과 무관하므로 어느 추천에서도 일관되게 불충족이다.
    policyId: 'jungsocheong-jeonse',
    productName: '중소기업취업청년 전월세보증금대출',
    limitRatio: 0.8,
    limitAmount: 100000000,
    coreFindings: [
      { requirement: '만 34세 이하', result: 'PASS', basis: PERSONA_AGE_BASIS },
      {
        requirement: '중소·중견기업 재직',
        result: 'FAIL',
        basis: '재직 중인 회사가 중소·중견기업으로 확인되지 않음',
      },
      { requirement: '세대원 전원 무주택', result: 'PASS', basis: '세대원 전원 무주택' },
      { requirement: '소득(기본 3천5백만원 이하)', result: 'PASS', basis: PERSONA_INCOME_BASIS },
    ],
    eligibilityChecklist: [
      { criteria: '만 34세 이하', status: 'met' },
      { criteria: '무주택 세대구성원', status: 'met' },
      { criteria: '연 소득 3천5백만원 이하', status: 'met' },
      { criteria: '중소·중견기업 재직', status: 'not_met' },
    ],
    advice:
      '중소기업진흥공단·신용보증기금 지원 대상 기업에 재직 중이면 신청할 수 있어요. ' +
      '재직 중인 회사의 중소·중견기업 확인서를 발급받아 취급 은행에 문의해보세요.',
  },
]

// 보증금 규모에 따른 실제 대출 한도. 만원 단위로 떨어지도록 반올림한다.
// 적격 여부와 무관하게 계산한다 — 계산식은 적격 심사가 아니라 목표 엔진 쪽 데이터라
// 요건을 못 갖춘 상품도 "받으면 이렇게 된다"를 보여준다(RecommendationLoanCard 참고).
export function loanLimitFor(product, depositAmount) {
  const limit = Math.min(depositAmount * product.limitRatio, product.limitAmount)
  return Math.round(limit / 10000) * 10000
}

// 요건 중 하나라도 FAIL이면 받을 수 없는 상품이다. 목표 상세의 "대출 활용" 토글은
// 적격 심사 화면이 아니라서 3-state 대신 이 boolean을 쓰고, 못 받는 이유는 문장 대신
// eligibilityChecklist의 not_met 항목이 들고 있다(ineligibleReason은 null로 유지).
export function loanEligibility(product) {
  return !product.coreFindings.some((finding) => finding.result === 'FAIL')
}

export const SEED_GOAL = {
  id: 1,
  goalType: 'HOUSING',
  status: 'ACTIVE',
  housing: {
    regionCode: SEED_MARKET.regionCode,
    // 표시용 전체 지역명. 진단에서 동까지 골랐으므로 동도 포함한다 — 홈 목표 카드가
    // 이 문자열에서 시도만 떼어내 "관악구 봉천동"으로 쓴다(ActiveGoalCard.shortRegionName).
    regionName: `${SEED_MARKET.fullRegionName} ${SEED_MARKET.dongName}`,
    dongCode: SEED_MARKET.dongCode,
    housingType: SEED_MARKET.housingType,
    dealType: SEED_MARKET.dealType,
    areaMin: SEED_MARKET.areaMin,
    areaMax: SEED_MARKET.areaMax,
    // 보증금 범위는 진단에서 선택하지 않았다. 목표 조회(GET /goals/{goalId})가 null로 내려줘야
    // 수정 폼이 "답하지 않은 조건"으로 보고 슬라이더 기본값(1억~3억)을 쓴다
    // (useGoalConditionSteps.applyInitialValue). "제한 없음"을 뜻하는 큰 수(1000억)를 넣으면
    // 그 값이 그대로 슬라이더에 채워지는데, 보증금 단계의 범위는 0~10억이라 큰 라벨만
    // "0억 ~ 1000억"으로 튀고 눈금과 어긋난다.
    depositMin: null,
    depositMax: null,
  },

  targetDate: '2029-09-30',
  targetAmount: SEED_MARKET.middleAmount,
  monthlySaving: 700000,
  progress: {
    currentAmount: SEED_AVAILABLE_FUNDS,
    remainingAmount: SEED_MARKET.middleAmount - SEED_AVAILABLE_FUNDS,
    // 소수 첫째 자리까지. 자산·시세를 손보면 여기도 따라 움직여야 또래 비교의
    // achievement.mine과 어긋나지 않는다.
    achievementRate: Math.round((SEED_AVAILABLE_FUNDS / SEED_MARKET.middleAmount) * 1000) / 10,
  },
  savingHistory: {
    recentAverageSaving: 820000,
    latestSaving: 950000,
  },
  createdAt: '2026-08-05T14:32:10',
  updatedAt: '2026-08-06T17:21:44',
}
