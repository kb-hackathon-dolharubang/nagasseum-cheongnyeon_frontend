import {
  SEED_ASSET_INSTITUTIONS,
  SEED_ASSET_SUMMARY,
  SEED_MANUAL_ASSETS,
  SEED_MEMBER,
} from '@/mocks/data/seed'

export const mockOrganizationsResponse = {
  success: true,
  data: [
    {
      organizationCode: '0004',
      organizationName: 'KB국민은행',
      businessType: 'BK',
      supportedLoginTypes: ['ID', 'CERTIFICATE'],
      // 연동 화면(AssetLinkView)이 isConnected인 기관을 목록에서 빼므로, 여기를 true로 두면
      // 은행 그룹에서 KB국민은행이 사라진다. 연동 시연의 출발점으로 쓰려고 미연동으로 둔다.
      isConnected: false,
    },
    {
      organizationCode: '0088',
      organizationName: '신한은행',
      businessType: 'BK',
      supportedLoginTypes: ['ID', 'CERTIFICATE'],
      isConnected: true,
    },
    {
      organizationCode: '0020',
      organizationName: '우리은행',
      businessType: 'BK',
      supportedLoginTypes: ['ID', 'CERTIFICATE'],
      isConnected: false,
    },
    {
      organizationCode: '0081',
      organizationName: '하나은행',
      businessType: 'BK',
      supportedLoginTypes: ['ID', 'CERTIFICATE'],
      isConnected: false,
    },
    {
      organizationCode: '0089',
      organizationName: 'IBK기업은행',
      businessType: 'BK',
      supportedLoginTypes: ['ID', 'CERTIFICATE'],
      isConnected: false,
    },
    // 한국장학재단은 은행이 아니지만 businessType에 BK/ST/CD 세 값밖에 없어(businessType.js)
    // 계좌를 은행처럼 다루는 BK로 둔다. 코드도 아래 증권/카드와 같은 임의 코드다.
    {
      organizationCode: '3001',
      organizationName: '한국장학재단',
      businessType: 'BK',
      supportedLoginTypes: ['ID', 'CERTIFICATE'],
      isConnected: true,
    },
    // 증권/카드는 실제 금융기관 표준코드가 아닌 로컬 테스트용 임의 코드다.
    {
      organizationCode: '1001',
      organizationName: '미래에셋증권',
      businessType: 'ST',
      supportedLoginTypes: ['ID', 'CERTIFICATE'],
      isConnected: true,
    },
    {
      organizationCode: '1002',
      organizationName: '삼성증권',
      businessType: 'ST',
      supportedLoginTypes: ['ID', 'CERTIFICATE'],
      isConnected: false,
    },
    {
      organizationCode: '1003',
      organizationName: '키움증권',
      businessType: 'ST',
      supportedLoginTypes: ['ID', 'CERTIFICATE'],
      isConnected: false,
    },
    {
      organizationCode: '2001',
      organizationName: '신한카드',
      businessType: 'CD',
      supportedLoginTypes: ['ID', 'CERTIFICATE'],
      isConnected: false,
    },
    {
      organizationCode: '2002',
      organizationName: '삼성카드',
      businessType: 'CD',
      supportedLoginTypes: ['ID', 'CERTIFICATE'],
      isConnected: false,
    },
    {
      organizationCode: '2003',
      organizationName: 'KB국민카드',
      businessType: 'CD',
      supportedLoginTypes: ['ID', 'CERTIFICATE'],
      isConnected: false,
    },
  ],
  error: null,
}

// 페르소나가 이미 연동해 둔 기관. KB국민은행은 연동 화면에서 직접 골라 연동하는 시연을
// 위해 일부러 빼 두었고, 시연에서 연동하면 createMockConnectionResponse가 여기에 넣는다.
export const mockConnectionsResponse = {
  success: true,
  data: [
    {
      organizationCode: '0088',
      organizationName: '신한은행',
      businessType: 'BK',
      connectedAt: '2026-07-23T10:04:00',
    },
    {
      organizationCode: '1001',
      organizationName: '미래에셋증권',
      businessType: 'ST',
      connectedAt: '2026-07-23T10:09:00',
    },
    {
      organizationCode: '3001',
      organizationName: '한국장학재단',
      businessType: 'BK',
      connectedAt: '2026-07-23T10:12:00',
    },
  ],
  error: null,
}

export function createMockConnectionResponse(organizationCode) {
  const organization = mockOrganizationsResponse.data.find(
    (item) => item.organizationCode === organizationCode,
  )

  if (organization) organization.isConnected = true

  const action = mockConnectionsResponse.data.length === 0 ? 'CREATED' : 'ADDED'

  if (!mockConnectionsResponse.data.some((item) => item.organizationCode === organizationCode)) {
    mockConnectionsResponse.data.push({
      organizationCode,
      organizationName: organization?.organizationName ?? '',
      businessType: organization?.businessType ?? '',
      connectedAt: new Date().toISOString(),
    })
  }

  return {
    success: true,
    data: {
      connectedId: 'byi1wYwD40k8hEIiXl6bRF',
      organization: organizationCode,
      action,
    },
    error: null,
  }
}

export function deleteMockConnection(organizationCode) {
  const index = mockConnectionsResponse.data.findIndex(
    (item) => item.organizationCode === organizationCode,
  )

  if (index === -1) {
    return {
      success: false,
      error: {
        code: 'ASSET_ORGANIZATION_NOT_CONNECTED',
        message: '연동되지 않은 기관입니다.',
        fields: null,
      },
    }
  }

  const [removed] = mockConnectionsResponse.data.splice(index, 1)

  const organization = mockOrganizationsResponse.data.find(
    (item) => item.organizationCode === organizationCode,
  )
  if (organization) organization.isConnected = false

  return {
    success: true,
    data: {
      organizationCode: removed.organizationCode,
      organizationName: removed.organizationName,
    },
    error: null,
  }
}

// 노션 "자산 동기화"(POST /api/v1/assets/sync) / "자산 동기화 상태 조회"
// (GET /api/v1/assets/sync/status/{jobId}) 비동기 폴링 흐름을 로컬에서 재현하기 위한 목 상태.
// 상태 조회를 SYNC_JOB_PENDING_CHECKS번 PENDING으로 응답한 뒤 SUCCESS로 전환한다.
const SYNC_JOB_PENDING_CHECKS = 2
const mockSyncJobs = new Map()

export function createMockSyncJob() {
  const jobId = crypto.randomUUID()
  mockSyncJobs.set(jobId, { checkCount: 0 })
  return jobId
}

export function getMockSyncJobStatus(jobId) {
  const job = mockSyncJobs.get(jobId)
  if (!job) return null

  job.checkCount += 1

  if (job.checkCount <= SYNC_JOB_PENDING_CHECKS) {
    return { jobId, status: 'PENDING', errorMessage: null, resultUrl: null }
  }

  mockSyncJobs.delete(jobId)
  return {
    jobId,
    status: 'SUCCESS',
    errorMessage: null,
    resultUrl: '/api/v1/assets/summary',
  }
}

export const mockConnectionFailureResponse = {
  success: false,
  error: {
    code: 'ASSET_CODEF_AUTH_FAILED',
    message: '기관 인증에 실패했습니다.',
    fields: null,
  },
}

// 노션 "자산 요약 조회"(GET /api/v1/assets/summary, @LoginMember) 응답 형태.
// 값 전부가 SEED_ASSET_SUMMARY(= SEED_ASSET_INSTITUTIONS에서 파생)에서 나오므로
// mockAssetAccountsResponse의 계좌 합산액과 항상 일치한다.
export const mockAssetSummaryResponse = {
  memberId: SEED_MEMBER.id,
  totalAssets: SEED_ASSET_SUMMARY.totalAssets,
  loanBalance: SEED_ASSET_SUMMARY.loanBalance,
  netAssets: SEED_ASSET_SUMMARY.netAssets,
  monthlySavings: SEED_ASSET_SUMMARY.monthlySavings,
  syncedAt: '2026-09-08T21:40:00+09:00',
  assetBreakdown: {
    cashAssets: {
      total: SEED_ASSET_SUMMARY.cashAssetsTotal,
      accounts: SEED_ASSET_SUMMARY.cashAccounts,
    },
    investmentAssets: {
      total: SEED_ASSET_SUMMARY.investmentAssetsTotal,
      accounts: SEED_ASSET_SUMMARY.investmentAccounts,
    },
  },
  loans: SEED_ASSET_SUMMARY.loans,
}

export const mockAssetSummaryNotFoundResponse = {
  success: false,
  data: null,
  error: {
    code: 'ASSET_SUMMARY_NOT_FOUND',
    message: '자산 연동 정보가 없습니다. 먼저 금융기관을 연동해주세요.',
  },
}

// 노션 "[추가] 수동 자산" CRUD(POST/GET/PUT/DELETE /api/v1/assets/manual)가 다루는 목록.
// assetType "DEPOSIT"은 계좌 목록 조회의 accountType과 이름은 같지만 의미가 다르다 (예: 현재 거주 보증금).
// 이 목록의 금액은 mockAssetSummaryResponse.totalAssets에 더해지지 않는다 — 지금 사는 집에
// 묶여 있어 목표에 쓸 수 없는 돈이라 자산 목록에만 보인다(seed.js의 totalAssets 주석 참고).
// 핸들러가 실제로 값을 더하고 빼며 조작하므로 let으로 선언하고, 초기값은 SEED_MANUAL_ASSETS를
// 복사해 시드 원본이 변형되지 않게 한다.
export let mockManualAssetsResponse = [...SEED_MANUAL_ASSETS]

export function setMockManualAssets(nextAssets) {
  mockManualAssetsResponse = nextAssets
}

export const mockManualAssetNotFoundResponse = {
  success: false,
  data: null,
  error: {
    code: 'ASSET_MANUAL_NOT_FOUND',
    message: '수동 자산을 찾을 수 없습니다.',
  },
}

// Figma "07 자산 상세 화면" 목업. [추가] 계좌 목록 조회 API(GET /api/v1/assets/accounts, @LoginMember) 응답 형태.
// 계좌 원본은 SEED_ASSET_INSTITUTIONS 하나뿐이라 mockAssetSummaryResponse의 합산액과 항상 일치한다.
export const mockAssetAccountsResponse = {
  institutions: SEED_ASSET_INSTITUTIONS,
}
