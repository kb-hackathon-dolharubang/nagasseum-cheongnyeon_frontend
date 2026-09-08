export function resolveCompareError(error, { hasSnapshotCheck = false } = {}) {
  const status = error.response?.status
  const code = error.response?.data?.error?.code

  if (status === 403) return { status: 'no-consent' }

  if (status === 404) {
    if (hasSnapshotCheck) return { status: 'no-snapshot' }
    return { status: 'no-asset' }
  }

  if (code === 'COMPARE_INCOME_REQUIRED') {
    return {
      status: 'error',
      errorMessage:
        '소득 정보가 없어 이 필터를 적용할 수 없어요. 마이페이지에서 소득 정보를 등록해주세요.',
    }
  }

  if (code === 'COMPARE_OCCUPATION_REQUIRED') {
    return {
      status: 'error',
      errorMessage:
        '직업 정보가 없어 이 필터를 적용할 수 없어요. 마이페이지에서 직업 정보를 등록해주세요.',
    }
  }

  return { status: 'error', errorMessage: '' }
}
