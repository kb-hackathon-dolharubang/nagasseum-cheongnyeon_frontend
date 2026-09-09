import { SEED_GOAL, SEED_MEMBER } from '@/mocks/data/seed'

// 26세(±2) · 순자산 320만원(±1,000만원) 구간의 또래 코호트. 소득은 8~9분위로 높은 편인데
// 아직 모은 돈은 또래 평균에 못 미치는 페르소나라, cohortAverageNetAssets를 내 순자산보다
// 조금 위에 둔다.
const COHORT = {
  assetRange: 10000000,
  ageRange: 2,
  cohortSize: 312,
  appliedFilters: [],
  sufficient: true,
  minimumRequired: null,
}

export const mockCompareAssetsSuccess = {
  success: true,
  data: {
    snapshotYm: '202608',
    cohort: COHORT,
    myMonthlyIncome: SEED_MEMBER.monthlyIncome,
    cohortAverageNetAssets: 5100000,
    // "내 월 저축액"은 자산 요약(assetBreakdown)·목표 화면과 같은 값(SEED_GOAL.monthlySaving)을 쓴다.
    saving: {
      mine: SEED_GOAL.monthlySaving,
      cohortMin: 300000,
      cohortMax: 1100000,
    },
    incomeBracketDistribution: [
      { bracket: 'INCOME_DECILE_1', ratio: 9.4 },
      { bracket: 'INCOME_DECILE_2_3', ratio: 18.1 },
      { bracket: 'INCOME_DECILE_4_5', ratio: 22.6 },
      { bracket: 'INCOME_DECILE_6_7', ratio: 20.9 },
      // 내 분위(SEED_MEMBER.incomeBracket). 상위 30%라 비중이 크지 않은 쪽에 속한다.
      { bracket: 'INCOME_DECILE_8_9', ratio: 17.5 },
      { bracket: 'INCOME_DECILE_10', ratio: 8.2 },
      { bracket: 'UNKNOWN', ratio: 3.3 },
    ],
    // occupationType은 라벨이 아니라 OCCUPATION_OPTIONS의 enum 값이어야 한다.
    // OccupationDistributionCard가 이 값을 myOccupationType과 직접 비교해 "나" 뱃지를 붙인다.
    occupationDistribution: [
      { occupationType: 'OFFICE_WORKER', ratio: 58.6 },
      { occupationType: 'FREELANCER', ratio: 14.2 },
      { occupationType: 'STUDENT', ratio: 11.8 },
      { occupationType: 'PUBLIC_SERVANT', ratio: 8.1 },
      { occupationType: 'SELF_EMPLOYED', ratio: 4.0 },
      { occupationType: 'UNKNOWN', ratio: 3.3 },
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
      cohortMin: 300000,
      cohortMax: 1100000,
    },
  },
  error: null,
}

export const mockCompareAssetsInsufficient = {
  success: true,
  data: {
    snapshotYm: '202608',
    cohort: {
      ...COHORT,
      cohortSize: null,
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
