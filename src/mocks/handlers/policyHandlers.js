import { http, HttpResponse, delay } from 'msw'

import { mockPolicyDetails, mockPolicySummaries } from '@/mocks/data/policy'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

function applyFilters(policies, { largeCategory, sort, keyword }) {
  let result = [...policies]

  if (largeCategory && largeCategory !== '전체') {
    if (largeCategory === '마감') {
      result = result.filter((p) => p.applyPeriodType === '마감' || p.applyPeriodType === '특정')
    } else {
      result = result.filter((p) => p.largeCategory === largeCategory)
    }
  }

  if (keyword) {
    const q = keyword.toLowerCase()
    result = result.filter(
      (p) => p.policyName.toLowerCase().includes(q) || p.policySummary.toLowerCase().includes(q),
    )
  }

  if (sort === 'deadline') {
    result = result.sort((a, b) => {
      if (!a.applyEndDate) return 1
      if (!b.applyEndDate) return -1
      return new Date(a.applyEndDate) - new Date(b.applyEndDate)
    })
  } else if (sort === 'alphabetical') {
    result = result.sort((a, b) => a.policyName.localeCompare(b.policyName, 'ko'))
  }

  return result
}

export const policyHandlers = [
  http.get(`${API_BASE_URL}/api/v1/policies`, async ({ request }) => {
    await delay(300)
    const { searchParams } = new URL(request.url)

    const page = Number(searchParams.get('page') ?? 0)
    const size = Number(searchParams.get('size') ?? 10)

    const filtered = applyFilters(mockPolicySummaries, {
      largeCategory: searchParams.get('largeCategory') ?? '전체',
      sort: searchParams.get('sort') ?? 'recommended',
      keyword: searchParams.get('keyword') ?? '',
    })

    const start = page * size
    const policies = filtered.slice(start, start + size)

    return HttpResponse.json({
      success: true,
      data: {
        policies,
        totalCount: filtered.length,
        page,
        size,
      },
      error: null,
    })
  }),

  http.get(`${API_BASE_URL}/api/v1/policies/:id`, async ({ params }) => {
    await delay(200)
    const detail = mockPolicyDetails[Number(params.id)]

    if (!detail) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          error: { code: 'POLICY_NOT_FOUND', message: '정책을 찾을 수 없습니다.' },
        },
        { status: 404 },
      )
    }

    return HttpResponse.json({ success: true, data: detail, error: null })
  }),
]
