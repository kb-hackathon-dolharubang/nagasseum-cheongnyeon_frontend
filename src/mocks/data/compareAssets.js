export const mockCompareAssetsSuccess = {
  success: true,
  data: {
    snapshotYm: '202607',
    cohort: {
      assetRange: 10000000,
      ageRange: 2,
      cohortSize: 247,
      appliedFilters: [],
      sufficient: true,
      minimumRequired: null,
    },
    myMonthlyIncome: 3000000,
    cohortAverageNetAssets: 45000000,
    saving: {
      mine: 900000,
      cohortMin: 500000,
      cohortMax: 1200000,
    },
    incomeBracketDistribution: [
      { bracket: 'INCOME_DECILE_1', ratio: 9.4 },
      { bracket: 'INCOME_DECILE_2_3', ratio: 18.1 },
      { bracket: 'INCOME_DECILE_4_5', ratio: 22.6 },
      { bracket: 'INCOME_DECILE_6_7', ratio: 20.9 },
      { bracket: 'INCOME_DECILE_8_9', ratio: 17.5 },
      { bracket: 'INCOME_DECILE_10', ratio: 8.2 },
      { bracket: 'UNKNOWN', ratio: 3.3 },
    ],
    occupationDistribution: [
      { occupationType: '직장인', ratio: 62.3 },
      { occupationType: '프리랜서', ratio: 18.5 },
      { occupationType: '학생', ratio: 19.2 },
    ],
  },
  error: null,
}

// 목표가 없는 사용자. saving.mine은 목표에 종속된 값이라 null — 자산 탭에서 저축액 카드 대신
// "목표를 세우면 저축 계획도 비교할 수 있어요" 잠금 카드로 대체되는지 확인할 때 쓴다.
export const mockCompareAssetsNoGoal = {
  success: true,
  data: {
    ...mockCompareAssetsSuccess.data,
    saving: {
      mine: null,
      cohortMin: 500000,
      cohortMax: 1200000,
    },
  },
  error: null,
}

export const mockCompareAssetsInsufficient = {
  success: true,
  data: {
    snapshotYm: '202607',
    cohort: {
      assetRange: 10000000,
      ageRange: 2,
      cohortSize: null,
      appliedFilters: [],
      sufficient: false,
      minimumRequired: 10,
    },
    myMonthlyIncome: null,
    cohortAverageNetAssets: null,
    saving: null,
    incomeBracketDistribution: null,
    occupationDistribution: null,
  },
  error: null,
}

// 자산 연동이 없는 사용자. 필요할 때 핸들러에서 수동으로 바꿔 끼운다.
export const mockCompareAssetsAssetRequired = {
  success: false,
  data: null,
  error: { code: 'COMPARE_ASSET_REQUIRED', message: '자산 연동이 필요합니다.' },
}
