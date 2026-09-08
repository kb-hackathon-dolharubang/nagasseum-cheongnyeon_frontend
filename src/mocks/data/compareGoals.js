export const mockCompareGoalsSuccess = {
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
    achievement: {
      mine: 60.0,
      cohortAverage: 52.0,
      buckets: [
        { rangeMin: 0, rangeMax: 10, count: 3, ratio: 1.2, isMine: false },
        { rangeMin: 10, rangeMax: 20, count: 12, ratio: 4.9, isMine: false },
        { rangeMin: 20, rangeMax: 30, count: 18, ratio: 7.3, isMine: false },
        { rangeMin: 30, rangeMax: 40, count: 34, ratio: 13.8, isMine: false },
        { rangeMin: 40, rangeMax: 50, count: 52, ratio: 21.1, isMine: false },
        { rangeMin: 50, rangeMax: 60, count: 61, ratio: 24.7, isMine: false },
        { rangeMin: 60, rangeMax: 70, count: 38, ratio: 15.4, isMine: true },
        { rangeMin: 70, rangeMax: 80, count: 19, ratio: 7.7, isMine: false },
        { rangeMin: 80, rangeMax: 100, count: 10, ratio: 4.0, isMine: false },
      ],
    },
    dealTypeDistribution: [
      { dealType: 'JEONSE', label: '전세', ratio: 73.0, rank: 1 },
      { dealType: 'WOLSE', label: '월세', ratio: 27.0, rank: 2 },
    ],
    averageTargetAmount: 240000000,
    averagePrepMonths: 14,
    popularRegions: [
      { rank: 1, regionCode: '11680', regionName: '강남구', ratio: 38.0 },
      { rank: 2, regionCode: '11440', regionName: '마포구', ratio: 26.0 },
      { rank: 3, regionCode: '11410', regionName: '서대문구', ratio: 17.0 },
    ],
  },
  error: null,
}

export const mockCompareGoalsInsufficient = {
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
    achievement: null,
    dealTypeDistribution: null,
    averageTargetAmount: null,
    averagePrepMonths: null,
    popularRegions: null,
  },
  error: null,
}

// 목표 자체가 없는 사용자. 목표 탭 잠금(teaser) 상태 확인용 — 필요할 때 핸들러에서 수동으로 바꿔 끼운다.
export const mockCompareGoalsSnapshotNotFound = {
  success: false,
  data: null,
  error: { code: 'COMPARE_SNAPSHOT_NOT_FOUND', message: '목표를 찾을 수 없습니다.' },
}

// 목표는 있으나 자산 연동이 없는 사용자.
export const mockCompareGoalsAssetRequired = {
  success: false,
  data: null,
  error: { code: 'COMPARE_ASSET_REQUIRED', message: '자산 연동이 필요합니다.' },
}
