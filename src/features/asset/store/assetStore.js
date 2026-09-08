import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { formatYearMonthDot } from '@/shared/utils/formatter'

import {
  createManualAsset,
  deleteAssetConnection,
  deleteManualAsset,
  getAssetAccounts,
  getAssetOrganizations,
  getAssetSummary,
  getAssetSyncStatus,
  getConnectedAssetOrganizations,
  getManualAssets,
  linkAssetConnection,
  syncAssets,
  updateManualAsset,
} from '@/features/asset/api/assetApi'

const SYNC_STATUS = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
}

// 폴링 간격 2~3초 권장(명세) 중 짧은 쪽을 택하고, 체감 대기 시간이 30초를 넘지 않도록
// 총 폴링 시간을 20초(=2초 x 10회)로 제한한다. 초과 시 타임아웃으로 처리한다.
const SYNC_POLL_INTERVAL_MS = 2000
const SYNC_POLL_TIMEOUT_MS = 20000

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const FLOW_CONTEXT = {
  ONBOARDING: 'onboarding',
  ADDITIONAL: 'additional',
}

const FLOW_CONTEXT_STORAGE_KEY = 'assetFlowContext'

/*
  flowContext는 자산 연동(asset-link → asset-auth → asset-syncing) 흐름 중간에 있는
  화면이 "회원가입 중" 온보딩인지 "마이페이지에서 추가 연동"인지 구분하는 값이다.
  메모리 상태로만 두면 이 흐름 도중 새로고침했을 때 스토어가 초기화되며 기본값인
  ONBOARDING으로 돌아가버려서, 추가 연동 중이었는데도 회원가입 온보딩 화면(진행
  단계 표시, 뒤로가기 버튼 숨김)으로 보이고 동기화 완료 후 홈으로 잘못 이동한다.
  로그인 세션처럼 오래 남을 값이 아니라 진행 중인 흐름만 보존하면 되므로
  localStorage(useTheme.js)가 아닌 sessionStorage를 쓴다.
*/
function readStoredFlowContext() {
  try {
    const stored = sessionStorage.getItem(FLOW_CONTEXT_STORAGE_KEY)
    return Object.values(FLOW_CONTEXT).includes(stored) ? stored : null
  } catch {
    return null
  }
}

function writeStoredFlowContext(context) {
  try {
    sessionStorage.setItem(FLOW_CONTEXT_STORAGE_KEY, context)
  } catch {
    // 저장 실패해도 화면 동작에는 영향 없음
  }
}

const ACCOUNT_TYPE_LABELS = {
  DEPOSIT: '자유입출금',
  SAVINGS: '적금',
  STOCK: '주식',
  FUND: '펀드',
}

const ASSET_CATEGORY_LABELS = {
  현금성자산: '입출금·현금성 자산',
  예적금: '예금·적금',
  투자자산: '주식·펀드',
  청약: '청약통장',
  기타: '기타 자산',
}

const ASSET_CATEGORY_ORDER = ['현금성자산', '예적금', '투자자산', '청약', '기타']

const MANUAL_ASSET_TYPE_LABELS = {
  DEPOSIT: '현재 거주 보증금',
}

function buildAssetAccountViewModel(account, institutionName) {
  const typeLabel =
    ACCOUNT_TYPE_LABELS[account.accountType] ??
    ASSET_CATEGORY_LABELS[account.assetCategory] ??
    account.assetCategory
  const subLabel = account.maturityDate
    ? `${typeLabel} · 만기 ${formatYearMonthDot(account.maturityDate)}`
    : typeLabel

  return {
    id: `${institutionName}-${account.accountDisplay}`,
    name: `${institutionName} ${account.productName}`,
    subLabel,
    amount: account.currentValue ?? account.valuationAmount ?? 0,
  }
}

function buildLoanAccountViewModel(loan, institutionName) {
  return {
    id: `${institutionName}-${loan.accountDisplay}`,
    name: `${institutionName} ${loan.loanName}`,
    subLabel: loan.accountDisplay,
    amount: loan.loanBalance,
  }
}

function buildManualAssetViewModel(asset) {
  return {
    id: `manual-${asset.id}`,
    // 위 id는 연동 계좌 key와 섞이지 않게 접두어를 붙인 화면용 문자열이라, 수정·삭제
    // API(PUT/DELETE /api/v1/assets/manual/{id})에 그대로 넘길 수 없다. 원본 숫자 id와
    // assetType(수정 요청 본문에 함께 실어야 한다)을 따로 남긴다.
    manualId: asset.id,
    assetType: asset.assetType,
    name: MANUAL_ASSET_TYPE_LABELS[asset.assetType] ?? asset.assetType,
    subLabel: '직접 등록',
    amount: asset.amount,
  }
}

// 계좌 목록 조회(GET /api/v1/assets/accounts) 응답을
// 화면에서 쓰는 { categories, loans } 형태로 변환
// 총자산은 자산 요약 조회(GET /api/v1/assets/summary) 값을 그대로 사용
function transformAssetAccountsResponse(institutions) {
  const categoryMap = new Map()
  const loans = []

  for (const institution of institutions) {
    for (const account of institution.assetAccounts) {
      const viewModel = buildAssetAccountViewModel(account, institution.institutionName)

      const categoryKey = account.assetCategory
      if (!categoryMap.has(categoryKey)) {
        categoryMap.set(categoryKey, {
          type: categoryKey,
          label: ASSET_CATEGORY_LABELS[categoryKey] ?? categoryKey,
          totalAmount: 0,
          accounts: [],
        })
      }
      const category = categoryMap.get(categoryKey)
      category.totalAmount += viewModel.amount
      category.accounts.push(viewModel)
    }

    for (const loan of institution.loanAccounts) {
      loans.push(buildLoanAccountViewModel(loan, institution.institutionName))
    }
  }

  const categories = [...categoryMap.values()].sort((a, b) => {
    const orderA = ASSET_CATEGORY_ORDER.indexOf(a.type)
    const orderB = ASSET_CATEGORY_ORDER.indexOf(b.type)
    if (orderA === -1 && orderB === -1) return 0
    if (orderA === -1) return 1
    if (orderB === -1) return -1
    return orderA - orderB
  })

  return { categories, loans }
}

export const useAssetStore = defineStore('asset', () => {
  const organizations = ref([])
  const isLoaded = ref(false)
  const selectedInstitutions = ref([])

  const assetDetail = ref(null)
  const isLoadingDetail = ref(false)
  const isSyncing = ref(false)
  const syncError = ref(null)
  const detailError = ref(null)

  const connections = ref([])
  const isConnectionsLoaded = ref(false)
  const flowContext = ref(readStoredFlowContext() ?? FLOW_CONTEXT.ONBOARDING)

  async function fetchOrganizations({ force = false } = {}) {
    if (isLoaded.value && !force) return organizations.value

    organizations.value = await getAssetOrganizations()
    isLoaded.value = true
    return organizations.value
  }

  function setSelectedInstitutions(institutions) {
    selectedInstitutions.value = institutions
  }

  const currentInstitution = computed(() => selectedInstitutions.value[0] ?? null)

  function patchOrganizationConnected(organizationCode, isConnected) {
    const organization = organizations.value.find(
      (item) => item.organizationCode === organizationCode,
    )
    if (organization) organization.isConnected = isConnected
  }

  async function authenticateCurrentInstitution(credentials) {
    const institution = currentInstitution.value
    await linkAssetConnection({
      organization: institution.id,
      businessType: institution.businessType,
      ...credentials,
    })
    selectedInstitutions.value = selectedInstitutions.value.slice(1)

    patchOrganizationConnected(institution.id, true)
    if (!connections.value.some((item) => item.organizationCode === institution.id)) {
      connections.value = [
        ...connections.value,
        {
          organizationCode: institution.id,
          organizationName: institution.name,
          businessType: institution.businessType,
          connectedAt: new Date().toISOString(),
        },
      ]
    }
  }

  async function fetchConnections({ force = false } = {}) {
    if (isConnectionsLoaded.value && !force) return connections.value

    connections.value = await getConnectedAssetOrganizations()
    isConnectionsLoaded.value = true
    return connections.value
  }

  async function removeConnection(organizationCode) {
    await deleteAssetConnection(organizationCode)
    connections.value = connections.value.filter(
      (item) => item.organizationCode !== organizationCode,
    )
    patchOrganizationConnected(organizationCode, false)
  }

  function setFlowContext(context) {
    flowContext.value = context
    writeStoredFlowContext(context)
  }

  async function fetchAssetDetail() {
    isLoadingDetail.value = true
    detailError.value = null

    try {
      const [accounts, summary, manualAssets] = await Promise.all([
        getAssetAccounts(),
        getAssetSummary(),
        getManualAssets(),
      ])

      assetDetail.value = {
        ...transformAssetAccountsResponse(accounts.institutions),
        // 인벤토리는 원본 institutions가 필요하다. categories는 accountType과
        // 기관 이름이 남지 않아서 타일을 못 만든다.
        institutions: accounts.institutions,
        totalAssets: summary.totalAssets,
        syncedAt: summary.syncedAt,
        manualAssets: manualAssets.map(buildManualAssetViewModel),
      }
    } catch (e) {
      detailError.value = e
      assetDetail.value = null
    } finally {
      isLoadingDetail.value = false
    }
  }

  async function pollAssetSyncStatus(jobId) {
    const deadline = Date.now() + SYNC_POLL_TIMEOUT_MS

    while (Date.now() < deadline) {
      const { status, errorMessage } = await getAssetSyncStatus(jobId)

      if (status === SYNC_STATUS.SUCCESS) return
      if (status === SYNC_STATUS.FAILED) {
        throw new Error(errorMessage ?? '자산 동기화에 실패했어요.')
      }

      await wait(SYNC_POLL_INTERVAL_MS)
    }

    throw new Error('자산 동기화가 지연되고 있어요. 잠시 후 다시 시도해주세요.')
  }

  async function runAssetSync() {
    isSyncing.value = true
    syncError.value = null
    try {
      const { jobId } = await syncAssets()
      await pollAssetSyncStatus(jobId)
      await fetchAssetDetail()
    } catch (e) {
      syncError.value = e
    } finally {
      isSyncing.value = false
    }
  }

  function startAssetSync() {
    runAssetSync()
  }

  async function addManualAsset(payload) {
    await createManualAsset(payload)
    await fetchAssetDetail()
  }

  async function editManualAsset(id, payload) {
    await updateManualAsset(id, payload)
    await fetchAssetDetail()
  }

  async function removeManualAsset(id) {
    await deleteManualAsset(id)
    await fetchAssetDetail()
  }

  return {
    organizations,
    isLoaded,
    selectedInstitutions,
    currentInstitution,
    connections,
    isConnectionsLoaded,
    flowContext,
    fetchOrganizations,
    setSelectedInstitutions,
    authenticateCurrentInstitution,
    fetchConnections,
    removeConnection,
    setFlowContext,
    assetDetail,
    isLoadingDetail,
    isSyncing,
    syncError,
    detailError,
    fetchAssetDetail,
    runAssetSync,
    startAssetSync,
    addManualAsset,
    editManualAsset,
    removeManualAsset,
  }
})
