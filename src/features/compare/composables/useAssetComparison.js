import { getAssetComparison } from '@/features/compare/api/compareApi'
import { useComparisonFetcher } from '@/features/compare/composables/useComparisonFetcher'

/**
 * 자산 탭 조회. 목표 없이 자산 연동만 있어도 'ready'가 된다.
 * status: loading | ready | insufficient | no-asset | no-consent | error
 */
export function useAssetComparison() {
  return useComparisonFetcher(getAssetComparison, { hasSnapshotCheck: false })
}
