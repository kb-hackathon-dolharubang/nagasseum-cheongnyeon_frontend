import { ref } from 'vue'

import { resolveCompareError } from '@/features/compare/composables/compareStatus'

export function useComparisonFetcher(fetchComparison, { hasSnapshotCheck = false } = {}) {
  const status = ref('loading')
  const comparison = ref(null)
  const errorMessage = ref('')

  async function fetch(params) {
    status.value = 'loading'
    errorMessage.value = ''

    try {
      const body = await fetchComparison(params)
      comparison.value = body.data
      status.value = body.data?.cohort?.sufficient === false ? 'insufficient' : 'ready'
    } catch (error) {
      const resolved = resolveCompareError(error, { hasSnapshotCheck })
      status.value = resolved.status
      errorMessage.value = resolved.errorMessage ?? ''
    }
  }

  return { status, comparison, errorMessage, fetch }
}
