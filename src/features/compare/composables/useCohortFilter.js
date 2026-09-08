import { computed, ref } from 'vue'

export const DEFAULT_ASSET_RANGE = 10_000_000
export const DEFAULT_AGE_RANGE = 2

export const MAX_ASSET_RANGE = 30_000_000
export const MAX_AGE_RANGE = 5

const COHORT_STORAGE_KEY = 'compare-cohort-range'

function loadCohortFilter() {
  try {
    const saved = JSON.parse(localStorage.getItem(COHORT_STORAGE_KEY))
    return {
      assetRange: Number(saved?.assetRange) || DEFAULT_ASSET_RANGE,
      ageRange: Number(saved?.ageRange) || DEFAULT_AGE_RANGE,
      cohortTypes: Array.isArray(saved?.cohortTypes) ? saved.cohortTypes : [],
    }
  } catch {
    return { assetRange: DEFAULT_ASSET_RANGE, ageRange: DEFAULT_AGE_RANGE, cohortTypes: [] }
  }
}

/**
 * cohortTypes 필터는 해당 정보를 등록한 사용자만 쓸 수 있다(COMPARE_INCOME_REQUIRED 등).
 * CompareView(요청 직전)와 CohortEditSheet(시트 초기값) 양쪽에서 같은 기준으로 걸러야 해서 공유한다.
 */
export function filterEligibleCohortTypes(types, { hasIncomeInfo, hasOccupationInfo }) {
  return types.filter((type) => {
    if (type === 'INCOME') return hasIncomeInfo
    if (type === 'OCCUPATION') return hasOccupationInfo
    return true
  })
}

export function useCohortFilter() {
  const saved = loadCohortFilter()
  const assetRange = ref(saved.assetRange)
  const ageRange = ref(saved.ageRange)
  const cohortTypes = ref(saved.cohortTypes)

  const canWidenCohort = computed(
    () => assetRange.value < MAX_ASSET_RANGE || ageRange.value < MAX_AGE_RANGE,
  )

  function applyCohort({ assetRange: nextAsset, ageRange: nextAge, cohortTypes: nextTypes }) {
    assetRange.value = nextAsset
    ageRange.value = nextAge
    cohortTypes.value = nextTypes ?? []
    localStorage.setItem(
      COHORT_STORAGE_KEY,
      JSON.stringify({
        assetRange: assetRange.value,
        ageRange: ageRange.value,
        cohortTypes: cohortTypes.value,
      }),
    )
  }

  return {
    assetRange,
    ageRange,
    cohortTypes,
    canWidenCohort,
    applyCohort,
  }
}
