<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppHeader from '@/shared/components/molecules/AppHeader.vue'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'
import BaseModal from '@/shared/components/atoms/feedback/Modal/BaseModal.vue'
import BaseSkeleton from '@/shared/components/atoms/feedback/Skeleton/BaseSkeleton.vue'
import BaseEmptyState from '@/shared/components/atoms/feedback/EmptyState/BaseEmptyState.vue'
import BaseAlert from '@/shared/components/atoms/feedback/Alert/BaseAlert.vue'
import BaseToast from '@/shared/components/atoms/feedback/Toast/BaseToast.vue'
import { BUSINESS_TYPE_LABELS } from '@/shared/constants/businessType'
import { useAsyncLoad } from '@/shared/composables/useAsyncLoad'

import ConnectedInstitutionCard from '@/features/asset/components/ConnectedInstitutionCard.vue'
import { FLOW_CONTEXT, useAssetStore } from '@/features/asset/store/assetStore'

const SKELETON_ROW_COUNT = 3

const router = useRouter()
const assetStore = useAssetStore()

const { isLoading, errorMessage, run: loadConnections } = useAsyncLoad()

const isDeleteModalOpen = ref(false)
const deleteTargetCode = ref(null)
const isDeleting = ref(false)
const deleteErrorMessage = ref('')

const showSuccessToast = ref(false)
const successMessage = ref('')

const institutions = computed(() =>
  assetStore.connections.map((connection) => ({
    id: connection.organizationCode,
    name: connection.organizationName,
    category: BUSINESS_TYPE_LABELS[connection.businessType] ?? connection.businessType,
  })),
)

const deleteTargetName = computed(
  () =>
    institutions.value.find((institution) => institution.id === deleteTargetCode.value)?.name ?? '',
)

function openDeleteModal(organizationCode) {
  deleteTargetCode.value = organizationCode
  deleteErrorMessage.value = ''
  isDeleteModalOpen.value = true
}

function closeDeleteModal() {
  isDeleteModalOpen.value = false
  deleteTargetCode.value = null
}

async function confirmDelete() {
  const organizationCode = deleteTargetCode.value
  const institutionName = deleteTargetName.value
  isDeleting.value = true
  deleteErrorMessage.value = ''

  try {
    await assetStore.removeConnection(organizationCode)
    closeDeleteModal()
    successMessage.value = `${institutionName} 연동을 해제했어요`
    showSuccessToast.value = true
  } catch {
    deleteErrorMessage.value = '연동 해제에 실패했습니다. 잠시 후 다시 시도해주세요.'
  } finally {
    isDeleting.value = false
  }
}

function goToAdditionalLink() {
  assetStore.setFlowContext(FLOW_CONTEXT.ADDITIONAL)
  router.push({ name: 'asset-link' })
}

onMounted(() =>
  loadConnections(() => assetStore.fetchConnections(), {
    skipSkeleton: assetStore.isConnectionsLoaded,
    errorMessage: '연동된 자산을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
  }),
)
</script>

<template>
  <div class="asset-manage-view asset-manage-view--animated">
    <AppHeader title="자산 연동 관리" @back="router.back()" />

    <div class="asset-manage-view__body">
      <p v-if="errorMessage" class="asset-manage-view__error">{{ errorMessage }}</p>

      <ul v-if="isLoading" class="asset-manage-view__list">
        <li v-for="n in SKELETON_ROW_COUNT" :key="n">
          <BaseSkeleton height="76px" radius="16px" />
        </li>
      </ul>

      <BaseEmptyState v-else-if="institutions.length === 0" message="연동된 금융기관이 없어요" />

      <TransitionGroup v-else tag="ul" name="connected-list" class="asset-manage-view__list">
        <li v-for="institution in institutions" :key="institution.id">
          <ConnectedInstitutionCard :institution="institution" @delete="openDeleteModal" />
        </li>
      </TransitionGroup>
    </div>

    <div class="asset-manage-view__footer">
      <BaseButton size="lg" @click="goToAdditionalLink">추가 연동하기</BaseButton>
    </div>

    <BaseModal v-model="isDeleteModalOpen" title="연동을 해제할까요?">
      <p class="asset-manage-view__modal-desc">
        {{ deleteTargetName }} 연동을 해제하면 관련 자산 데이터가 삭제돼요
      </p>
      <BaseAlert v-if="deleteErrorMessage" variant="error">{{ deleteErrorMessage }}</BaseAlert>
      <template #footer>
        <BaseButton variant="secondary" :disabled="isDeleting" @click="closeDeleteModal">
          취소
        </BaseButton>
        <BaseButton variant="primary" :disabled="isDeleting" @click="confirmDelete">
          {{ isDeleting ? '해제 중...' : '연동 해제' }}
        </BaseButton>
      </template>
    </BaseModal>

    <BaseToast v-model="showSuccessToast" variant="success">{{ successMessage }}</BaseToast>
  </div>
</template>

<style scoped>
.asset-manage-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  padding: 16px 24px 24px;
}

.asset-manage-view__body {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/*
  비교/마이페이지와 같은 card-rise 진입 모션(main.css에 공용 정의)을 재사용해서
  헤더 아래 목록/버튼이 순서대로 살짝 떠오르며 나타나게 한다.
*/
.asset-manage-view--animated > * {
  animation: card-rise 0.35s ease-out both;
}

.asset-manage-view--animated > *:nth-child(2) {
  animation-delay: 0.04s;
}

.asset-manage-view--animated > *:nth-child(3) {
  animation-delay: 0.08s;
}

.asset-manage-view__list {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.connected-list-move,
.connected-list-enter-active,
.connected-list-leave-active {
  transition: all 0.25s ease;
}

.connected-list-enter-from,
.connected-list-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.connected-list-leave-active {
  position: absolute;
  width: 100%;
}

.asset-manage-view__error {
  margin: 0;
  font-size: 13px;
  color: #e03131;
}

.asset-manage-view__footer {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.asset-manage-view__modal-desc {
  margin: 0;
  color: #4a5a52;
  font-size: 13px;
  text-align: center;
}
</style>
