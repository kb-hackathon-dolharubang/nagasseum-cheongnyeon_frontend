<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppHeader from '@/shared/components/molecules/AppHeader.vue'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'
import BaseModal from '@/shared/components/atoms/feedback/Modal/BaseModal.vue'
import BaseInputField from '@/shared/components/molecules/BaseInputField.vue'
import BaseSkeleton from '@/shared/components/atoms/feedback/Skeleton/BaseSkeleton.vue'
import { formatNumber } from '@/shared/utils/formatter'

import AssetTotalCard from '@/features/asset/components/AssetTotalCard.vue'
import AssetInventoryGrid from '@/features/asset/components/AssetInventoryGrid.vue'
import AssetDebtBanner from '@/features/asset/components/AssetDebtBanner.vue'
import { useAssetStore } from '@/features/asset/store/assetStore'

// 온보딩의 보증금 입력(DepositInfoView)과 같은 상한. 두 화면이 같은 값을 다루므로 맞춘다.
const MAX_AMOUNT = 10 ** 18

/*
  새로 등록할 때 쓰는 자산 종류. 지금 수동 자산은 전월세 보증금 하나뿐이라 고정값이다
  (assetStore의 MANUAL_ASSET_TYPE_LABELS도 DEPOSIT 하나만 갖고 있다).
  종류가 늘어나면 이 값 대신 선택 단계가 필요해진다.
*/
const DEPOSIT_ASSET_TYPE = 'DEPOSIT'

const router = useRouter()
const assetStore = useAssetStore()

onMounted(() => {
  if (!assetStore.assetDetail) assetStore.fetchAssetDetail()
})

/*
  직접 등록한 자산(보증금 등) 수정 팝업.

  가입 때 한 번 입력하면 고칠 곳이 없다는 QA 지적을 받아, 그 금액이 실제로 보이는 자리인
  인벤토리 타일에서 바로 열도록 했다. 값이 null이면 팝업이 닫힌 상태다.
*/
const isEditorOpen = ref(false)
// 고칠 대상. null이면 새로 등록하는 중이다.
const editingAsset = ref(null)
// 화면에는 콤마를 넣어 보여주고, 서버에는 숫자만 보낸다 (DepositInfoView와 같은 방식).
const amountInput = ref('')
const isSaving = ref(false)
// 삭제는 되돌릴 수 없어 한 번 더 묻는다. 팝업을 겹쳐 띄우면 뒤로가기 동작이 꼬여서
// 같은 팝업 안에서 확인 단계로 전환한다.
const isConfirmingDelete = ref(false)
const errorMessage = ref('')

const numericAmount = computed(() => Number(amountInput.value.replace(/,/g, '')) || 0)
// 0원은 "자산이 없다"는 뜻이라 삭제로 처리해야 맞다. 저장으로는 막는다.
const canSave = computed(() => !isSaving.value && numericAmount.value > 0)

const modalTitle = computed(() => {
  if (isConfirmingDelete.value) return '삭제할까요?'
  return editingAsset.value?.name ?? '현재 거주 보증금'
})

function openEditor(asset) {
  editingAsset.value = asset
  amountInput.value = formatNumber(asset.amount ?? 0)
  isConfirmingDelete.value = false
  errorMessage.value = ''
  isEditorOpen.value = true
}

function openCreator() {
  editingAsset.value = null
  // 등록은 빈 칸에서 시작한다. 0을 채워두면 지우고 쓰는 손이 한 번 더 간다.
  amountInput.value = ''
  isConfirmingDelete.value = false
  errorMessage.value = ''
  isEditorOpen.value = true
}

function closeEditor() {
  // 저장·삭제 요청이 날아가는 중에 닫으면 결과를 알릴 곳이 없어진다.
  if (isSaving.value) return
  isEditorOpen.value = false
}

function handleAmountInput(value) {
  const digits = String(value).replace(/\D/g, '')
  amountInput.value = digits ? formatNumber(Math.min(Number(digits), MAX_AMOUNT)) : ''
}

async function handleSave() {
  if (!canSave.value) return

  isSaving.value = true
  errorMessage.value = ''

  try {
    // 두 액션 모두 끝나면 스토어가 fetchAssetDetail로 목록까지 다시 불러온다.
    if (editingAsset.value) {
      await assetStore.editManualAsset(editingAsset.value.manualId, {
        assetType: editingAsset.value.assetType,
        amount: numericAmount.value,
      })
    } else {
      await assetStore.addManualAsset({
        assetType: DEPOSIT_ASSET_TYPE,
        amount: numericAmount.value,
      })
    }
    isEditorOpen.value = false
  } catch (error) {
    errorMessage.value =
      error.response?.data?.error?.message ?? '저장에 실패했어요. 잠시 후 다시 시도해주세요.'
  } finally {
    isSaving.value = false
  }
}

async function handleDelete() {
  isSaving.value = true
  errorMessage.value = ''

  try {
    await assetStore.removeManualAsset(editingAsset.value.manualId)
    isEditorOpen.value = false
  } catch (error) {
    errorMessage.value =
      error.response?.data?.error?.message ?? '삭제에 실패했어요. 잠시 후 다시 시도해주세요.'
    isConfirmingDelete.value = false
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="asset-detail-view asset-detail-view--animated">
    <AppHeader title="자산 인벤토리" @back="router.back()" />

    <template v-if="assetStore.assetDetail">
      <AssetTotalCard
        :total-assets="assetStore.assetDetail.totalAssets"
        :synced-at="assetStore.assetDetail.syncedAt"
        :is-refreshing="assetStore.isSyncing"
        @refresh="assetStore.runAssetSync"
      />

      <p v-if="assetStore.syncError" class="asset-detail-view__sync-error">
        {{ assetStore.syncError.message }}
      </p>

      <AssetInventoryGrid
        :institutions="assetStore.assetDetail.institutions"
        :manual-assets="assetStore.assetDetail.manualAssets"
        @edit="openEditor"
        @add="openCreator"
      />

      <AssetDebtBanner :loans="assetStore.assetDetail.loans" />
    </template>

    <div v-else-if="assetStore.isLoadingDetail" class="asset-detail-view__skeleton">
      <BaseSkeleton height="140px" radius="14px" />
      <BaseSkeleton height="220px" radius="14px" />
      <BaseSkeleton height="220px" radius="14px" />
    </div>

    <p v-else-if="assetStore.detailError" class="asset-detail-view__error">
      자산 정보를 불러오지 못했어요.
    </p>

    <!--
      BaseModal은 body로 teleport되므로 이 화면이 들고 있는 --c-* 변수가 닿지 않는다.
      팝업 안에서는 공용 테마 토큰(--color-*)과 공용 컴포넌트만 쓴다.
    -->
    <BaseModal :model-value="isEditorOpen" :title="modalTitle" @update:model-value="closeEditor">
      <div class="asset-detail-view__modal">
        <p v-if="isConfirmingDelete" class="asset-detail-view__modal-text">
          {{ editingAsset?.name }} 항목이 자산 목록에서 사라져요. 총자산 계산에서도 빠집니다.
        </p>

        <template v-else>
          <BaseInputField
            :model-value="amountInput"
            label="금액"
            type="text"
            placeholder="0"
            @update:model-value="handleAmountInput"
          >
            <template #suffix>원</template>
          </BaseInputField>

          <!-- 아직 없는 자산은 지울 수 없다. 등록 모드에서는 감춘다. -->
          <button
            v-if="editingAsset"
            type="button"
            class="asset-detail-view__modal-delete"
            :disabled="isSaving"
            @click="isConfirmingDelete = true"
          >
            이 자산 삭제하기
          </button>
        </template>

        <p v-if="errorMessage" class="asset-detail-view__modal-error">{{ errorMessage }}</p>
      </div>

      <template #footer>
        <template v-if="isConfirmingDelete">
          <BaseButton variant="secondary" :disabled="isSaving" @click="isConfirmingDelete = false">
            취소
          </BaseButton>
          <BaseButton variant="primary" :disabled="isSaving" @click="handleDelete">
            {{ isSaving ? '삭제 중...' : '삭제' }}
          </BaseButton>
        </template>

        <template v-else>
          <BaseButton variant="secondary" :disabled="isSaving" @click="closeEditor">
            취소
          </BaseButton>
          <BaseButton variant="primary" :disabled="!canSave" @click="handleSave">
            <template v-if="isSaving">{{ editingAsset ? '저장 중...' : '등록 중...' }}</template>
            <template v-else>{{ editingAsset ? '저장' : '등록' }}</template>
          </BaseButton>
        </template>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.asset-detail-view {
  /*
    자산 인벤토리 색. 비교 화면과 같은 이름을 쓴다.

    다크는 원래 색을 그대로 둔다(민트·골드).
    라이트만 main.css의 공용 테마 토큰에 붙인다. main.css는 건드리지 않는다.
  */
  --c-bg: #111111;
  --c-card: #171b16;
  --c-line: #334234;
  --c-ink: #e8f0e6;
  --c-ink-muted: #7fa398;
  --c-ink-faint: #7fa398;
  --c-accent: #9fd8ab;
  --c-accent-mid: #4f7a5c;
  --c-accent-soft: #263029;
  --c-slot: #263029;
  /* 금액은 다크에서만 금색. 라이트에서는 굵은 검정이 더 잘 읽힌다. */
  --c-value: #ffd939;
  --c-on-accent: #16281c;
  --c-danger: #e2735f;
  --c-danger-soft: #1e1512;
  --c-danger-line: #5c2f28;
  --c-danger-slot: #2b1a15;
  /* 총자산 카드만 배경색이 따로 있다. */
  --c-hero-bg: #f7ffd1;
  --c-hero-line: #f7ffd1;
  --c-hero-ink: #12281c;
  --c-hero-muted: #8a8f63;
  --c-hero-btn-bg: #12281c;
  --c-hero-btn-ink: #f7ffd1;
  /*
    AppHeader가 쓰는 legacy 변수. 이 화면에서만 테마 토큰으로 바꿔 끼운다.
  */
  --text-h: var(--color-text-primary);

  /*
    앱 배경이 아직 테마를 따라가지 않아 이 화면만 직접 칠한다. MobileLayout의 여백을
    음수 마진으로 상쇄해 배경을 화면 끝까지 깔고, 본문 여백은 다시 준다.

    이 화면은 하단 탭을 숨기므로(MobileLayout의 HIDDEN_NAV_ROUTE_NAMES) 레이아웃이
    --no-nav 여백(16px)을 쓴다. 예전에는 탭이 있다고 보고 -96px로 상쇄했는데, 탭이
    사라진 지금 그 값을 그대로 두면 배경이 화면 아래로 80px 더 끌려 내려간다.
  */
  margin: -16px;
  padding: 16px 16px 32px;
  background: var(--c-bg);

  display: flex;
  flex-direction: column;
  gap: 14px;
}

/*
  비교/마이페이지와 같은 card-rise 진입 모션(main.css에 공용 정의)을 재사용해서
  홈에서 자산 인벤토리로 들어올 때도 헤더 아래 카드가 순서대로 떠오르며 나타나게 한다.
*/
.asset-detail-view--animated > * {
  animation: card-rise 0.35s ease-out both;
}

.asset-detail-view--animated > *:nth-child(2) {
  animation-delay: 0.04s;
}

.asset-detail-view--animated > *:nth-child(3) {
  animation-delay: 0.08s;
}

.asset-detail-view--animated > *:nth-child(4) {
  animation-delay: 0.12s;
}

.asset-detail-view--animated > *:nth-child(5) {
  animation-delay: 0.16s;
}

:root[data-theme='light'] .asset-detail-view {
  --c-bg: var(--color-app-bg);
  --c-card: var(--color-surface);
  --c-line: var(--color-border);
  --c-ink: var(--color-text-primary);
  /*
    카드 설명 글 색. 디자인에서 지정한 값이라 공용 토큰 대신 직접 쓴다.
    흰 카드에서 6.2:1, 앱 배경에서 5.8:1로 기준(4.5:1)을 넘는다. 비교 화면과 같은 값.
  */
  --c-ink-muted: #5b6358;
  /*
    공용 --color-text-tertiary(#8f968c)는 흰 카드에서 3.04:1로 기준(4.5:1)에 못 미친다.
    여기 쓰이는 기관명이 10px라 더 불리해서 한 단계 진하게 쓴다. 비교 화면과 같은 값.
  */
  --c-ink-faint: #6f7a6d;
  --c-accent: var(--color-heading-accent);
  /*
    공용 --color-progress-inactive는 "게이지 빈 칸"용 회색(라이트 #e3e7e0)으로 바뀌었다.
    여기서 필요한 건 보조 막대·띠에 쓰는 중간 톤 초록이라 뜻이 달라서 값을 직접 쓴다.
  */
  --c-accent-mid: #a9c9b0;
  --c-accent-soft: #e8f4ea;
  --c-slot: #1d6b3f;
  --c-value: var(--color-text-primary);
  --c-on-accent: #ffffff;
  --c-danger: #c1442e;
  --c-danger-soft: #fdeeea;
  --c-danger-line: #f2cec5;
  --c-danger-slot: #7a2c1e;
  --c-hero-bg: #e8f4ea;
  --c-hero-line: #a9c9b0;
  --c-hero-ink: var(--color-text-primary);
  --c-hero-muted: var(--color-text-secondary);
  --c-hero-btn-bg: var(--color-heading-accent);
  --c-hero-btn-ink: #ffffff;
}

/*
  AppHeader는 공용 컴포넌트라 파일을 고치지 않는다. 제목이 font-weight 400이라
  화면에서 제일 큰 글자인데도 얇게 보여서 이 화면에서만 굵기를 덮는다.
*/
.asset-detail-view :deep(.app-header__title) {
  font-weight: 700;
}

.asset-detail-view__skeleton {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.asset-detail-view__error {
  padding: 24px 0;
  color: var(--c-ink-muted);
  text-align: center;
}

.asset-detail-view__sync-error {
  margin: 0;
  padding: 9px 12px;
  border: 1px solid var(--c-danger-line);
  border-radius: 10px;
  background: var(--c-danger-soft);
  color: var(--c-danger);
  font-size: 11px;
  line-height: 1.5;
}

/*
  아래 규칙들은 teleport된 팝업 안에서 쓰인다. slot 안의 노드는 이 컴포넌트가 만든 것이라
  scoped 스타일이 그대로 붙지만, 이 화면 루트(.asset-detail-view)의 --c-* 변수는
  body로 옮겨간 팝업까지 상속되지 않으므로 공용 테마 토큰만 쓴다.
*/

/*
  BaseInputField·BaseFieldBadge·BaseInput은 테마를 안 타는 legacy 변수
  (--text-h / --text / --border)를 쓴다. 정의가 없으면 폴백이 흰색(#ffffff)이라
  라이트 모드의 밝은 팝업 배경에서 라벨이 안 보인다. 공용 컴포넌트를 고치는 대신
  이 팝업 안에서만 시맨틱 토큰으로 바꿔 끼운다(GoalConditionStepsView와 같은 방식).
*/
.asset-detail-view__modal {
  --text-h: var(--color-text-primary);
  --text: var(--color-text-secondary);
  --border: var(--color-border);
  --card-bg: var(--color-surface);
}

/*
  필수/선택 배지를 감춘다. 이 팝업에는 입력이 금액 하나뿐이라 무엇과 구분하라는 표시인지
  알 수 없고, 비우면 저장 버튼이 이미 비활성화되어 배지가 더 알려주는 것이 없다.
  BaseInputField는 라벨이 있으면 배지를 항상 붙이고 끄는 prop이 없어서, 공용 컴포넌트를
  고치는 대신 이 팝업 안에서만 감춘다.
*/
.asset-detail-view__modal :deep(.base-field-badge) {
  display: none;
}

.asset-detail-view__modal-text {
  margin: 0;
  color: var(--color-text-secondary, #9aa09a);
  font-size: 13.2px;
  line-height: 1.6;
}

.asset-detail-view__modal-delete {
  margin-top: 14px;
  padding: 6px 0;
  border: none;
  background: none;
  color: var(--color-point, #c1442e);
  font: inherit;
  font-size: 13.2px;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}

.asset-detail-view__modal-delete:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.asset-detail-view__modal-error {
  margin: 12px 0 0;
  color: var(--color-point, #c1442e);
  font-size: 12px;
  line-height: 1.5;
}
</style>
