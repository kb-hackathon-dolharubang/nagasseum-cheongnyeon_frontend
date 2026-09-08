import { ref, computed, unref } from 'vue'

export function usePagination(totalItems, pageSize = 10) {
  const page = ref(1)

  const totalPages = computed(() => Math.max(1, Math.ceil(unref(totalItems) / pageSize)))

  function setPage(nextPage) {
    page.value = Math.min(Math.max(1, nextPage), totalPages.value)
  }

  return { page, totalPages, setPage }
}
