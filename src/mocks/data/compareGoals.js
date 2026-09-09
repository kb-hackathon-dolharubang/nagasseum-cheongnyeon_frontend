import { SEED_GOAL, SEED_MEMBER } from '@/mocks/data/seed'

// 자산 탭(compareAssets)과 같은 코호트를 본다. 두 탭의 cohortSize·평균이 달라지면
// 같은 또래를 두 번 다르게 설명하는 셈이 된다.
const COHORT = {
  assetRange: 10000000,
  ageRange: 2,
  cohortSize: 312,
  appliedFilters: [],
  sufficient: true,
  minimumRequired: null,
}

export const mockCompareGoalsSuccess = {
  success: true,
  data: {
    snapshotYm: '202608',
    cohort: COHORT,
    myMonthlyIncome: SEED_MEMBER.monthlyIncome,
    cohortAverageNetAssets: 5100000,
    // mine은 목표 상세 화면과 같은 SEED_GOAL.progress.achievementRate(1.8)를 쓰므로,
    // isMine 표시도 그 값이 속하는 0~10 구간에 둔다. count 합은 cohortSize(312)와 같다.
    achievement: {
      mine: SEED_GOAL.progress.achievementRate,
      cohortAverage: 30.1,
      buckets: [
        { rangeMin: 0, rangeMax: 10, count: 70, ratio: 22.4, isMine: true },
        { rangeMin: 10, rangeMax: 20, count: 58, ratio: 18.6, isMine: false },
        { rangeMin: 20, rangeMax: 30, count: 49, ratio: 15.7, isMine: false },
        { rangeMin: 30, rangeMax: 40, count: 41, ratio: 13.1, isMine: false },
        { rangeMin: 40, rangeMax: 50, count: 34, ratio: 10.9, isMine: false },
        { rangeMin: 50, rangeMax: 60, count: 24, ratio: 7.7, isMine: false },
        { rangeMin: 60, rangeMax: 70, count: 17, ratio: 5.4, isMine: false },
        { rangeMin: 70, rangeMax: 80, count: 11, ratio: 3.5, isMine: false },
        { rangeMin: 80, rangeMax: 100, count: 8, ratio: 2.7, isMine: false },
      ],
    },
    dealTypeDistribution: [
      { dealType: 'JEONSE', label: '전세', ratio: 47.0, rank: 1 },
      { dealType: 'WOLSE', label: '월세', ratio: 41.0, rank: 2 },
      { dealType: 'TRADE', label: '매매', ratio: 12.0, rank: 3 },
    ],
    averageTargetAmount: 165000000,
    averagePrepMonths: 31,
    // 관악구가 1위인 건 우연이 아니라 이 코호트(사회 초년 1인가구)의 실제 쏠림을 흉내낸 것이다.
    // 내 목표 지역(SEED_GOAL.housing.regionCode)과 같아야 "또래도 여기를 본다"는 인사이트가 선다.
    popularRegions: [
      { rank: 1, regionCode: '11620', regionName: '관악구', ratio: 24.6 },
      { rank: 2, regionCode: '11590', regionName: '동작구', ratio: 15.2 },
      { rank: 3, regionCode: '11290', regionName: '성북구', ratio: 11.8 },
    ],
    // policyId는 mockPolicySummaries의 id와 같아야 카드에서 정책 상세로 넘어갈 수 있다.
    topPolicies: [
      { rank: 1, policyId: 1, policyName: '청년 전세자금 대출', benefitRatio: 54.8 },
      { rank: 2, policyId: 2, policyName: '청년도약계좌', benefitRatio: 38.1 },
      { rank: 3, policyId: 4, policyName: '청년 주택드림 청약통장', benefitRatio: 26.3 },
      { rank: 4, policyId: 5, policyName: '행복주택 청년 입주', benefitRatio: 21.7 },
      { rank: 5, policyId: 3, policyName: '청년 월세 지원', benefitRatio: 9.4 },
    ],
  },
  error: null,
}

export const mockCompareGoalsInsufficient = {
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
    achievement: null,
    dealTypeDistribution: null,
    averageTargetAmount: null,
    averagePrepMonths: null,
    popularRegions: null,
    topPolicies: null,
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
