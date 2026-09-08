import httpClient from '@/shared/api/httpClient'

const COHORT_TYPES_PARAMS_SERIALIZER = { indexes: null }

export async function getGoalComparison({ assetRange, ageRange, cohortTypes } = {}) {
  const { data } = await httpClient.get('/api/v1/comparison/goals', {
    params: { assetRange, ageRange, cohortTypes },
    paramsSerializer: COHORT_TYPES_PARAMS_SERIALIZER,
  })
  return data
}

export async function getAssetComparison({ assetRange, ageRange, cohortTypes } = {}) {
  const { data } = await httpClient.get('/api/v1/comparison/assets', {
    params: { assetRange, ageRange, cohortTypes },
    paramsSerializer: COHORT_TYPES_PARAMS_SERIALIZER,
  })
  return data
}
