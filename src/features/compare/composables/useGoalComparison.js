import { getGoalComparison } from '@/features/compare/api/compareApi'
import { useComparisonFetcher } from '@/features/compare/composables/useComparisonFetcher'

export function useGoalComparison() {
  return useComparisonFetcher(getGoalComparison, { hasSnapshotCheck: true })
}
