// 목 데이터 전체가 이 파일 하나의 페르소나에서 파생된다. 화면끼리 숫자가 어긋나면
// (자산 요약의 총자산 ≠ 목표의 "이미 가진 돈" 같은) 데모에서 바로 티가 나므로,
// 값을 새로 쓰지 말고 여기 시드를 참조하거나 여기서 파생시킨다.
//
// 페르소나: 26세 회사원, 월 소득 310만원(소득 8~9분위), 순자산 320만원.
// 서울 관악구 봉천동 오피스텔 전세(10~20평, 시세 1.8억)를 2029-07까지 월 70만원씩 모아 준비한다.

export const SEED_MEMBER = {
  id: 1,
  nickname: '김OO',
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
        currentValue: 1200000,
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
        currentValue: 4200000,
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
        currentValue: 2000000,
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
        valuationAmount: 800000,
        depositReceived: 750000,
        valuationPl: 50000,
        purchaseAmount: 750000,
        earningsRate: 6.67,
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

// 전세자금대출 3종. 목표 상세의 "대출 활용" 토글, 진단 결과의 loans[], 홈 추천 정책이
// 같은 상품을 가리키도록 여기서 한 번만 정의한다. limitRatio는 임차보증금 대비 한도 비율,
// limitAmount는 상품 자체의 최대 한도다(둘 중 작은 쪽이 실제 한도).
export const SEED_LOAN_PRODUCTS = [
  {
    policyId: 'beotimmok-jeonse',
    productName: '청년전용 버팀목전세자금대출',
    limitRatio: 0.8,
    limitAmount: 200000000,
    eligible: true,
    ineligibleReason: null,
    aiGuide:
      '이 대출은 혼인 여부에 따라 한도가 달라질 수 있어요. 실제 신청 전 취급 은행에서 직접 확인해보세요.',
  },
  {
    // 자격 미달 카드를 한 장 남겨 진단 결과·목표 상세의 잠금 UI를 확인한다. 재직 요건은
    // 희망 조건(보증금·면적)과 무관하므로 어느 추천에서도 일관되게 자격이 없다.
    policyId: 'jungsocheong-jeonse',
    productName: '중소기업취업청년 전월세보증금대출',
    limitRatio: 0.8,
    limitAmount: 100000000,
    eligible: false,
    ineligibleReason: '중소·중견기업 재직 확인이 되지 않아 이 대출은 신청하기 어려워요.',
    aiGuide: null,
  },
  {
    policyId: 'bank-general-jeonse',
    productName: '은행 일반 전세자금대출',
    limitRatio: 0.7,
    limitAmount: 500000000,
    eligible: true,
    ineligibleReason: null,
    aiGuide: null,
  },
]

// 보증금 규모에 따른 실제 대출 한도. 만원 단위로 떨어지도록 반올림한다.
export function loanLimitFor(product, depositAmount) {
  if (!product.eligible) return null
  const limit = Math.min(depositAmount * product.limitRatio, product.limitAmount)
  return Math.round(limit / 10000) * 10000
}

export const SEED_GOAL = {
  id: 1,
  goalType: 'HOUSING',
  status: 'ACTIVE',
  housing: {
    regionCode: SEED_MARKET.regionCode,
    regionName: SEED_MARKET.regionName,
    dongCode: SEED_MARKET.dongCode,
    housingType: SEED_MARKET.housingType,
    dealType: SEED_MARKET.dealType,
    areaMin: SEED_MARKET.areaMin,
    areaMax: SEED_MARKET.areaMax,
    // 보증금 범위는 진단에서 선택하지 않았다. 백엔드가 @NotNull로 받으므로 "제한 없음"에
    // 해당하는 기본값으로 정규화되어 저장된다.
    depositMin: 0,
    depositMax: 100000000000,
  },

  targetDate: '2029-07-31',
  targetAmount: SEED_MARKET.middleAmount,
  monthlySaving: 700000,
  progress: {
    currentAmount: SEED_AVAILABLE_FUNDS,
    remainingAmount: SEED_MARKET.middleAmount - SEED_AVAILABLE_FUNDS,
    achievementRate: 1.8,
  },
  savingHistory: {
    recentAverageSaving: 820000,
    latestSaving: 950000,
  },
  createdAt: '2026-08-05T14:32:10',
  updatedAt: '2026-08-06T17:21:44',
}
