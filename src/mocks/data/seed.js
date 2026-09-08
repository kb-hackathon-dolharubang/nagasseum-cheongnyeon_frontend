export const SEED_MEMBER = {
  id: 1,
  nickname: '김OO',
  monthlyIncome: 3000000,
  incomeBracket: 'INCOME_DECILE_2_3',
  occupationType: 'OFFICE_WORKER',
}

export const SEED_ASSET_INSTITUTIONS = [
  {
    institutionName: '토스뱅크',
    assetAccounts: [
      {
        accountType: 'DEPOSIT',
        assetCategory: '현금성자산',
        accountDisplay: '****-**-1234',
        productName: '파킹통장',
        currentValue: 6400000,
        valuationAmount: null,
        depositReceived: null,
        valuationPl: null,
        purchaseAmount: null,
        earningsRate: null,
        startDate: '2024-02-10',
        maturityDate: null,
      },
    ],
    loanAccounts: [],
  },
  {
    institutionName: '카카오뱅크',
    assetAccounts: [
      {
        accountType: 'DEPOSIT',
        assetCategory: '현금성자산',
        accountDisplay: '****-**-5678',
        productName: '입출금통장',
        currentValue: 1200000,
        valuationAmount: null,
        depositReceived: null,
        valuationPl: null,
        purchaseAmount: null,
        earningsRate: null,
        startDate: '2023-11-02',
        maturityDate: null,
      },
      {
        accountType: 'SAVINGS',
        assetCategory: '예적금',
        accountDisplay: '****-**-4321',
        productName: '자유적금',
        currentValue: 8200000,
        valuationAmount: null,
        depositReceived: null,
        valuationPl: null,
        purchaseAmount: null,
        earningsRate: null,
        startDate: '2025-03-01',
        maturityDate: '2027-03-01',
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
        currentValue: 9500000,
        valuationAmount: null,
        depositReceived: null,
        valuationPl: null,
        purchaseAmount: null,
        earningsRate: null,
        startDate: '2024-12-01',
        maturityDate: '2026-12-01',
      },
    ],
    loanAccounts: [
      {
        loanName: '신한 마이카대출',
        accountDisplay: '****-**-7799',
        loanBalance: 12000000,
        startDate: '2025-01-10',
        endDate: '2030-01-10',
      },
    ],
  },
  {
    institutionName: 'KB국민은행',
    assetAccounts: [
      {
        accountType: 'SAVINGS',
        assetCategory: '예적금',
        accountDisplay: '****-**-1122',
        productName: '정기예금',
        currentValue: 4000000,
        valuationAmount: null,
        depositReceived: null,
        valuationPl: null,
        purchaseAmount: null,
        earningsRate: null,
        startDate: '2023-06-01',
        maturityDate: '2027-06-01',
      },
      {
        accountType: 'SUBSCRIPTION',
        assetCategory: '청약',
        accountDisplay: '****-**-3344',
        productName: '주택청약종합저축',
        currentValue: 1080000,
        valuationAmount: null,
        depositReceived: null,
        valuationPl: null,
        purchaseAmount: null,
        earningsRate: null,
        startDate: '2021-01-15',
        maturityDate: null,
      },
    ],
    loanAccounts: [
      {
        loanName: 'KB주택담보대출',
        accountDisplay: '****-**-5566',
        loanBalance: 100000000,
        startDate: '2022-03-01',
        endDate: '2032-03-01',
      },
    ],
  },
  {
    institutionName: '토스증권',
    assetAccounts: [
      {
        accountType: 'STOCK',
        assetCategory: '투자자산',
        accountDisplay: '****-**-9900',
        productName: 'CMA',
        currentValue: null,
        valuationAmount: 2100000,
        depositReceived: 2000000,
        valuationPl: 100000,
        purchaseAmount: 2000000,
        earningsRate: 5.0,
        startDate: '2024-05-20',
        maturityDate: null,
      },
      {
        accountType: 'FUND',
        assetCategory: '투자자산',
        accountDisplay: '****-**-9911',
        productName: '글로벌리츠펀드',
        currentValue: null,
        valuationAmount: 3200000,
        depositReceived: 3500000,
        valuationPl: -300000,
        purchaseAmount: 3500000,
        earningsRate: -8.57,
        startDate: '2024-09-12',
        maturityDate: null,
      },
    ],
    loanAccounts: [],
  },
  {
    institutionName: '미래에셋증권',
    assetAccounts: [
      {
        accountType: 'FOREIGN_CURRENCY',
        assetCategory: '기타',
        accountDisplay: '****-**-2233',
        productName: '외화 RP',
        currentValue: 850000,
        valuationAmount: null,
        depositReceived: null,
        valuationPl: null,
        purchaseAmount: null,
        earningsRate: null,
        startDate: '2025-02-20',
        maturityDate: null,
      },
    ],
    loanAccounts: [],
  },
]

const CASH_ACCOUNT_TYPES = ['DEPOSIT', 'SAVINGS']
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
    amount: 50000000,
    createdAt: '2026-06-01T10:00:00+09:00',
    updatedAt: '2026-06-01T10:00:00+09:00',
  },
]

export const SEED_GOAL = {
  id: 1,
  goalType: 'HOUSING',
  status: 'ACTIVE',
  housing: {
    regionCode: '11680',
    regionName: '서울 강남구',
    housingType: 'OFFICETEL',
    dealType: 'JEONSE',
    areaMin: 10,
    areaMax: 20,
    depositMin: 300000000,
    depositMax: 600000000,
  },

  targetDate: '2028-09-30',
  targetAmount: 360000000,
  monthlySaving: 500000,
  progress: {
    currentAmount: 347000000,
    remainingAmount: 13000000,
    achievementRate: 96.4,
  },
  savingHistory: {
    recentAverageSaving: 620000,
    latestSaving: 700000,
  },
  createdAt: '2026-08-05T14:32:10',
  updatedAt: '2026-08-06T17:21:44',
}
