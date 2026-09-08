import httpClient from '@/shared/api/httpClient'

export async function getPolicyList({
  largeCategory = '전체',
  sort = 'recommended',
  keyword = '',
  page = 0,
  size = 20,
} = {}) {
  const { data } = await httpClient.get('/api/v1/policies', {
    params: { largeCategory, sort, keyword, page, size },
  })
  return data.data
}

export async function getPolicyDetail(id) {
  const { data } = await httpClient.get(`/api/v1/policies/${id}`)
  return data.data
}
