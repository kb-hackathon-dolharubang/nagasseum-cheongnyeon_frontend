import { ref } from 'vue'

export function useAsyncLoad() {
  const isLoading = ref(false)
  const errorMessage = ref('')

  async function run(task, { skipSkeleton = false, errorMessage: failureMessage = '' } = {}) {
    errorMessage.value = ''
    isLoading.value = !skipSkeleton

    try {
      await task()
    } catch {
      errorMessage.value = failureMessage
    } finally {
      isLoading.value = false
    }
  }

  return { isLoading, errorMessage, run }
}
