import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { getPolicyDetail, getPolicyList } from '@/features/policy/api/policyApi'

const SORT_LABELS = {
  recommended: '추천순',
  deadline: '마감임박순',
  alphabetical: '가나다순',
}

export const usePolicyStore = defineStore('policy', () => {
  const sort = ref('recommended')
  const keyword = ref('')
  const largeCategory = ref('전체')
  const showSortSheet = ref(false)
  const selectedPolicy = ref(null)
  const policies = ref([])
  const totalCount = ref(0)
  const loading = ref(false)
  const detailLoading = ref(false)

  const sortLabel = computed(() => SORT_LABELS[sort.value] ?? '추천순')

  async function fetchList() {
    loading.value = true
    try {
      const result = await getPolicyList({
        largeCategory: largeCategory.value,
        sort: sort.value,
        keyword: keyword.value,
      })
      policies.value = result.policies
      totalCount.value = result.totalCount
    } finally {
      loading.value = false
    }
  }

  async function openDetail(id) {
    detailLoading.value = true
    selectedPolicy.value = null
    try {
      selectedPolicy.value = await getPolicyDetail(id)
    } finally {
      detailLoading.value = false
    }
  }

  function closeDetail() {
    selectedPolicy.value = null
  }

  function setSort(value) {
    sort.value = value
    showSortSheet.value = false
    fetchList()
  }

  function setCategory(value) {
    largeCategory.value = value
    fetchList()
  }

  function setKeyword(value) {
    keyword.value = value
    fetchList()
  }

  return {
    sort,
    keyword,
    largeCategory,
    showSortSheet,
    selectedPolicy,
    policies,
    totalCount,
    loading,
    detailLoading,
    sortLabel,
    fetchList,
    openDetail,
    closeDetail,
    setSort,
    setCategory,
    setKeyword,
  }
})
