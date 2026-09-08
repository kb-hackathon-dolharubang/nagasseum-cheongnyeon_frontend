import { http, HttpResponse } from 'msw'

import {
  mockCompareAssetsAssetRequired,
  mockCompareAssetsInsufficient,
  mockCompareAssetsNoGoal,
  mockCompareAssetsSuccess,
} from '@/mocks/data/compareAssets'
import {
  mockCompareGoalsAssetRequired,
  mockCompareGoalsInsufficient,
  mockCompareGoalsSnapshotNotFound,
  mockCompareGoalsSuccess,
} from '@/mocks/data/compareGoals'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const BASE_COHORT = mockCompareGoalsSuccess.data.cohort
const MINIMUM_REQUIRED = mockCompareGoalsInsufficient.data.cohort.minimumRequired

/**
 * 목표 없음/자산 미연동 화면을 UI 조작만으로는 만들 수 없어서 만든 테스트 전용 값.
 * ageRange는 CohortEditSheet 슬라이더로 1~5까지만 도달 가능해서, 그 밖의 숫자는 실사용과 절대 겹치지 않는다.
 * 브라우저 콘솔에서 아래처럼 넣고 새로고침하면 된다:
 *   localStorage.setItem('compare-cohort-range', JSON.stringify({ assetRange: 10000000, ageRange: 91, cohortTypes: [] }))
 */
const TEST_AGE_RANGE = {
  // 목표 탭: 404 COMPARE_SNAPSHOT_NOT_FOUND(잠금 teaser). 자산 탭: saving.mine=null인 성공 응답.
  NO_GOAL: 91,
  // 두 탭 모두 404 COMPARE_ASSET_REQUIRED.
  NO_ASSET: 92,
}

/**
 * 범위를 넓히면 대상이 늘어나는 걸 화면에서 확인할 수 있도록 대충 비례시킨다.
 * 실제 집계 로직과는 무관한 목 전용 값이다.
 */
function fakeCohortSize(assetRange, ageRange) {
  const assetFactor = assetRange / BASE_COHORT.assetRange
  const ageFactor = ageRange / BASE_COHORT.ageRange
  return Math.round(BASE_COHORT.cohortSize * assetFactor * ageFactor)
}

function resolveCohort(request) {
  const params = new URL(request.url).searchParams
  const assetRange = Number(params.get('assetRange')) || BASE_COHORT.assetRange
  const ageRange = Number(params.get('ageRange')) || BASE_COHORT.ageRange
  return { assetRange, ageRange, cohortSize: fakeCohortSize(assetRange, ageRange) }
}

export const compareHandlers = [
  http.get(`${API_BASE_URL}/api/v1/comparison/goals`, ({ request }) => {
    const { assetRange, ageRange, cohortSize } = resolveCohort(request)

    if (ageRange === TEST_AGE_RANGE.NO_GOAL) {
      return HttpResponse.json(mockCompareGoalsSnapshotNotFound, { status: 404 })
    }
    if (ageRange === TEST_AGE_RANGE.NO_ASSET) {
      return HttpResponse.json(mockCompareGoalsAssetRequired, { status: 404 })
    }

    // k-익명성 미달이면 통계를 내리지 않는다.
    if (cohortSize < MINIMUM_REQUIRED) {
      return HttpResponse.json({
        ...mockCompareGoalsInsufficient,
        data: {
          ...mockCompareGoalsInsufficient.data,
          cohort: { ...mockCompareGoalsInsufficient.data.cohort, assetRange, ageRange, cohortSize },
        },
      })
    }

    return HttpResponse.json({
      ...mockCompareGoalsSuccess,
      data: {
        ...mockCompareGoalsSuccess.data,
        cohort: { ...BASE_COHORT, assetRange, ageRange, cohortSize },
      },
    })
  }),

  http.get(`${API_BASE_URL}/api/v1/comparison/assets`, ({ request }) => {
    const { assetRange, ageRange, cohortSize } = resolveCohort(request)

    if (ageRange === TEST_AGE_RANGE.NO_ASSET) {
      return HttpResponse.json(mockCompareAssetsAssetRequired, { status: 404 })
    }

    if (cohortSize < MINIMUM_REQUIRED) {
      return HttpResponse.json({
        ...mockCompareAssetsInsufficient,
        data: {
          ...mockCompareAssetsInsufficient.data,
          cohort: {
            ...mockCompareAssetsInsufficient.data.cohort,
            assetRange,
            ageRange,
            cohortSize,
          },
        },
      })
    }

    // 목표는 없지만 자산 연동은 있는 사용자: saving.mine만 null인 성공 응답.
    // ageRange는 화면 노출용 실제 값이 아니라 테스트 트리거이므로 그대로 보여주지 않고 기본값으로 되돌린다.
    if (ageRange === TEST_AGE_RANGE.NO_GOAL) {
      return HttpResponse.json({
        ...mockCompareAssetsNoGoal,
        data: { ...mockCompareAssetsNoGoal.data, cohort: { ...BASE_COHORT, assetRange } },
      })
    }

    return HttpResponse.json({
      ...mockCompareAssetsSuccess,
      data: {
        ...mockCompareAssetsSuccess.data,
        cohort: { ...BASE_COHORT, assetRange, ageRange, cohortSize },
      },
    })
  }),
]
