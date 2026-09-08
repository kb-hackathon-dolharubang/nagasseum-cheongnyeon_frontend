<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'
import BaseBreadcrumb from '@/shared/components/atoms/navigation/Breadcrumb/BaseBreadcrumb.vue'
import BaseSkeleton from '@/shared/components/atoms/feedback/Skeleton/BaseSkeleton.vue'
import AppHeader from '@/shared/components/molecules/AppHeader.vue'
import { ONBOARDING_STEPS } from '@/shared/constants/onboardingSteps'
import { BUSINESS_TYPE_LABELS } from '@/shared/constants/businessType'
import { useAsyncLoad } from '@/shared/composables/useAsyncLoad'

import AssetInstitutionCard from '@/features/asset/components/AssetInstitutionCard.vue'
import { FLOW_CONTEXT, useAssetStore } from '@/features/asset/store/assetStore'

const SKELETON_ROW_COUNT = 4

const router = useRouter()
const assetStore = useAssetStore()
const selectedIds = ref([])
const { isLoading, errorMessage, run: loadInstitutions } = useAsyncLoad()

const isOnboarding = computed(() => assetStore.flowContext === FLOW_CONTEXT.ONBOARDING)

const institutions = computed(() =>
  assetStore.organizations
    .filter((organization) => !organization.isConnected)
    .map((organization) => ({
      id: organization.organizationCode,
      name: organization.organizationName,
      category: BUSINESS_TYPE_LABELS[organization.businessType] ?? organization.businessType,
      businessType: organization.businessType,
    })),
)

const BUSINESS_TYPE_ORDER = ['BK', 'ST', 'CD']

const groupedInstitutions = computed(() => {
  const groups = new Map()
  for (const institution of institutions.value) {
    const group = groups.get(institution.businessType) ?? []
    group.push(institution)
    groups.set(institution.businessType, group)
  }

  return BUSINESS_TYPE_ORDER.filter((businessType) => groups.has(businessType)).map(
    (businessType) => ({
      businessType,
      label: BUSINESS_TYPE_LABELS[businessType] ?? businessType,
      institutions: groups.get(businessType),
    }),
  )
})

const selectedCount = computed(() => selectedIds.value.length)
const canSubmit = computed(() => selectedCount.value > 0)

function isSelected(id) {
  return selectedIds.value.includes(id)
}

function toggleInstitution(id) {
  selectedIds.value = isSelected(id)
    ? selectedIds.value.filter((selectedId) => selectedId !== id)
    : [...selectedIds.value, id]
}

function handleNext() {
  if (!canSubmit.value) return
  const selected = institutions.value.filter((institution) => isSelected(institution.id))
  assetStore.setSelectedInstitutions(selected)
  router.push({ name: 'asset-auth' })
}

onMounted(() =>
  loadInstitutions(() => assetStore.fetchOrganizations({ force: !isOnboarding.value }), {
    skipSkeleton: isOnboarding.value && assetStore.isLoaded,
    errorMessage: '연동 가능한 기관을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
  }),
)
</script>

<template>
  <div class="asset-link-view asset-link-view--animated">
    <AppHeader title="자산 연동" :show-back="!isOnboarding" @back="router.back()" />
    <BaseBreadcrumb
      v-if="isOnboarding"
      class="asset-link-view__steps"
      :steps="ONBOARDING_STEPS"
      :current="3"
    />

    <div class="asset-link-view__body">
      <div class="asset-link-view__intro">
        <h2 class="asset-link-view__title">연동할 기관을 선택하세요</h2>
        <p class="asset-link-view__subtitle">CODEF 인증 한 번으로 내 자산을 안전하게 측정해요</p>
      </div>

      <p v-if="errorMessage" class="asset-link-view__error">{{ errorMessage }}</p>

      <ul v-if="isLoading" class="asset-link-view__list">
        <li v-for="n in SKELETON_ROW_COUNT" :key="n">
          <BaseSkeleton height="76px" radius="16px" />
        </li>
      </ul>

      <div v-else class="asset-link-view__groups">
        <section
          v-for="group in groupedInstitutions"
          :key="group.businessType"
          class="asset-link-view__group"
        >
          <h3 class="asset-link-view__group-title">{{ group.label }}</h3>
          <ul class="asset-link-view__list">
            <li v-for="institution in group.institutions" :key="institution.id">
              <AssetInstitutionCard
                :institution="institution"
                :selected="isSelected(institution.id)"
                @toggle="toggleInstitution"
              />
            </li>
          </ul>
        </section>
      </div>
    </div>

    <div class="asset-link-view__footer">
      <BaseButton size="lg" :disabled="!canSubmit" @click="handleNext">
        선택한 기관 연동하기 ({{ selectedCount }})
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.asset-link-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  min-height: 100vh;
  padding: 16px 24px 24px;
}

.asset-link-view__steps {
  align-self: center;
}

.asset-link-view--animated > * {
  animation: card-rise 0.35s ease-out both;
}

.asset-link-view--animated > *:nth-child(2) {
  animation-delay: 0.04s;
}

.asset-link-view--animated > *:nth-child(3) {
  animation-delay: 0.08s;
}

.asset-link-view--animated > *:nth-child(4) {
  animation-delay: 0.12s;
}

.asset-link-view__body {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.asset-link-view__intro {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.asset-link-view__title {
  margin: 0;
  font-size: 15.9px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.asset-link-view__subtitle {
  margin: 0;
  font-size: 13.1px;
  color: var(--color-text-secondary);
}

.asset-link-view__groups {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.asset-link-view__group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 마이페이지 섹션 제목과 같은 스타일로 맞춘다. */
.asset-link-view__group-title {
  margin: 0;
  padding: 0 4px;
  font-size: 14.5px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.asset-link-view__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.asset-link-view__error {
  margin: 0;
  font-size: 13px;
  color: #e03131;
}

.asset-link-view__footer {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
