<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

import BaseClimbingLoader from '@/shared/components/atoms/feedback/ClimbingLoader/BaseClimbingLoader.vue'

import { FLOW_CONTEXT, useAssetStore } from '@/features/asset/store/assetStore'

const SYNC_DISPLAY_DURATION_MS = 1800

const router = useRouter()
const assetStore = useAssetStore()
let redirectTimer = null

const ADDITIONAL_FLOW_STEP_COUNT = 3

onMounted(() => {
  // 동기화 완료를 기다리지 않고 백그라운드로 진행 — 진행 상태는 자산 상세 화면에서 이어서 확인한다.
  assetStore.startAssetSync()

  redirectTimer = setTimeout(() => {
    const isAdditionalFlow = assetStore.flowContext === FLOW_CONTEXT.ADDITIONAL
    assetStore.setFlowContext(FLOW_CONTEXT.ONBOARDING)

    if (isAdditionalFlow) {
      router.go(-ADDITIONAL_FLOW_STEP_COUNT)
    } else {
      router.push({ name: 'home' })
    }
  }, SYNC_DISPLAY_DURATION_MS)
})

onUnmounted(() => {
  clearTimeout(redirectTimer)
})
</script>

<template>
  <div class="asset-syncing-view">
    <BaseClimbingLoader />
    <h2 class="asset-syncing-view__title">베이스캠프를 차리고 있어요</h2>
    <p class="asset-syncing-view__subtitle">연동한 기관의 자산 정보를 안전하게 받아오고 있어요</p>
  </div>
</template>

<style scoped>
.asset-syncing-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  width: 100%;
  min-height: 600px;
  padding: 64px 24px;
  text-align: center;
}

.asset-syncing-view__title {
  margin: 0;
  font-size: 15.9px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.asset-syncing-view__subtitle {
  margin: 0;
  font-size: 13.1px;
  color: var(--color-text-secondary);
}
</style>
