<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { formatEokManwon, formatManwon } from '@/shared/utils/formatter'
import AppHeader from '@/shared/components/molecules/AppHeader.vue'

import { FLOW_CONTEXT, useAssetStore } from '@/features/asset'
import { useMemberStore } from '@/features/member/store/memberStore'

import { useAssetComparison } from '@/features/compare/composables/useAssetComparison'
import {
  filterEligibleCohortTypes,
  useCohortFilter,
} from '@/features/compare/composables/useCohortFilter'
import { useGoalComparison } from '@/features/compare/composables/useGoalComparison'
import AchievementHistogramCard from '@/features/compare/components/AchievementHistogramCard.vue'
import CohortConditionCard from '@/features/compare/components/CohortConditionCard.vue'
import CohortEditSheet from '@/features/compare/components/CohortEditSheet.vue'
import CohortInsufficientNotice from '@/features/compare/components/CohortInsufficientNotice.vue'
import CompareLockedCard from '@/features/compare/components/CompareLockedCard.vue'
import CompareTabs from '@/features/compare/components/CompareTabs.vue'
import DealTypeDistributionCard from '@/features/compare/components/DealTypeDistributionCard.vue'
import IncomeBracketDistributionCard from '@/features/compare/components/IncomeBracketDistributionCard.vue'
import NetAssetHighlightCard from '@/features/compare/components/NetAssetHighlightCard.vue'
import OccupationDistributionCard from '@/features/compare/components/OccupationDistributionCard.vue'
import PopularRegionsCard from '@/features/compare/components/PopularRegionsCard.vue'
import SavingRangeCard from '@/features/compare/components/SavingRangeCard.vue'
import StateNoticeCard from '@/features/compare/components/StateNoticeCard.vue'

const router = useRouter()
const memberStore = useMemberStore()
const assetStore = useAssetStore()
const hasCompareConsent = computed(() => memberStore.profile?.compareDataAgreed ?? false)

function goToAdditionalAssetLink() {
  assetStore.setFlowContext(FLOW_CONTEXT.ADDITIONAL)
  router.push({ name: 'asset-link' })
}

const hasIncomeInfo = computed(() => memberStore.profile?.monthlyIncome != null)
const hasOccupationInfo = computed(() => memberStore.profile?.occupationType != null)

const { assetRange, ageRange, cohortTypes, canWidenCohort, applyCohort } = useCohortFilter()

const eligibleCohortTypes = computed(() =>
  filterEligibleCohortTypes(cohortTypes.value, {
    hasIncomeInfo: hasIncomeInfo.value,
    hasOccupationInfo: hasOccupationInfo.value,
  }),
)

const {
  status: goalStatus,
  comparison: goalComparison,
  errorMessage: goalErrorMessage,
  fetch: fetchGoalComparison,
} = useGoalComparison()

const {
  status: assetStatus,
  comparison: assetComparison,
  errorMessage: assetErrorMessage,
  fetch: fetchAssetComparison,
} = useAssetComparison()

const isEditOpen = ref(false)
const hasLoadedOnce = ref(false)
const activeTab = ref('asset') // 'asset' | 'goal'
let hasUserPickedTab = false

function selectTab(tab) {
  hasUserPickedTab = true
  activeTab.value = tab
}

const isGoalLocked = computed(() => goalStatus.value === 'no-snapshot')

const activeComparison = computed(() =>
  activeTab.value === 'goal' ? goalComparison.value : assetComparison.value,
)
const activeStatus = computed(() =>
  activeTab.value === 'goal' ? goalStatus.value : assetStatus.value,
)
const activeErrorMessage = computed(() =>
  activeTab.value === 'goal' ? goalErrorMessage.value : assetErrorMessage.value,
)

/**
 * 서버가 실제로 적용한 추가 필터.
 *
 * <p>탭마다 응답이 달라서 지금 보고 있는 탭 기준으로 읽는다.
 */
const appliedFilters = computed(() => activeComparison.value?.cohort?.appliedFilters ?? [])

/**
 * 소득·직업군으로 코호트를 좁히면 그 항목의 분포는 볼 것이 없어진다.
 *
 * <p>예를 들어 직업군을 켜면 비교 대상이 나와 같은 직업군만 남으므로 직업군 분포는
 * 무조건 한 줄에 100%가 된다. 당연한 결과를 카드 한 장으로 보여줄 이유가 없어 감춘다.
 */
const showIncomeDistribution = computed(() => !appliedFilters.value.includes('INCOME'))
const showOccupationDistribution = computed(() => !appliedFilters.value.includes('OCCUPATION'))

/**
 * 개월 수를 '1년 2개월'로 바꾼다.
 *
 * <p>서버는 준비 기간을 개월로만 내려준다. 두 자리가 되면 몇 년인지 머리로 나눠야 해서
 * 12개월부터는 연을 앞에 세운다. 12로 나눠떨어지면 '개월 0'을 붙이지 않는다.
 */
function formatPrepPeriod(months) {
  if (months == null) return '-'

  const years = Math.floor(months / 12)
  const restMonths = months % 12

  if (years === 0) return `${restMonths}개월`
  if (restMonths === 0) return `${years}년`
  return `${years}년 ${restMonths}개월`
}

const snapshotSource = computed(() => assetComparison.value ?? goalComparison.value)

const snapshotDigits = computed(() =>
  String(snapshotSource.value?.snapshotYm ?? '').replace(/\D/g, ''),
)

const snapshotLabel = computed(() => {
  const digits = snapshotDigits.value
  return digits.length >= 6 ? `${digits.slice(0, 4)}.${digits.slice(4, 6)}.01` : ''
})

const STALE_DAYS = 14
const isSnapshotStale = computed(() => {
  const digits = snapshotDigits.value
  if (digits.length < 6) return false
  const base = new Date(Number(digits.slice(0, 4)), Number(digits.slice(4, 6)) - 1, 1)
  return (Date.now() - base.getTime()) / 86_400_000 > STALE_DAYS
})

async function fetchAll() {
  if (!hasCompareConsent.value) {
    goalStatus.value = 'no-consent'
    assetStatus.value = 'no-consent'
    hasLoadedOnce.value = true
    return
  }

  const params = {
    assetRange: assetRange.value,
    ageRange: ageRange.value,
    cohortTypes: eligibleCohortTypes.value,
  }
  await Promise.all([fetchGoalComparison(params), fetchAssetComparison(params)])
  hasLoadedOnce.value = true

  if (!hasUserPickedTab) {
    activeTab.value =
      goalStatus.value === 'ready' || goalStatus.value === 'insufficient' ? 'goal' : 'asset'
  }
}

function handleApplyCohort(next) {
  isEditOpen.value = false
  applyCohort(next)
}

watch([assetRange, ageRange, cohortTypes], fetchAll)

onMounted(async () => {
  if (!memberStore.profile) {
    await memberStore.fetchProfile()
  }
  fetchAll()
})
</script>

<template>
  <div class="compare-view">
    <AppHeader title="또래 비교" :show-back="false" />

    <div class="compare-view__subheader">
      <p class="compare-view__desc">비슷한 자산의 또래와 목표·자산을 비교해보세요.</p>
      <span v-if="isSnapshotStale" class="compare-view__stale">
        {{ snapshotLabel }} 기준 · 2주 이전 데이터 집계
      </span>
    </div>

    <p v-if="!hasLoadedOnce" class="compare-view__notice">불러오는 중...</p>

    <CompareLockedCard v-else-if="goalStatus === 'no-consent'" />

    <template v-else>
      <CompareTabs :active-tab="activeTab" :goal-locked="isGoalLocked" @select="selectTab" />

      <Transition name="tab-fade" mode="out-in">
        <div :key="activeTab" class="compare-view__body">
          <StateNoticeCard
            v-if="activeTab === 'goal' && isGoalLocked"
            eyebrow="목표 비교 잠금"
            variant="wait"
            title="목표를 세우면 달성률과 저축 순위를 볼 수 있어요"
          >
            비슷한 자산의 또래들과 목표 달성률, 저축 구간 순위를 비교해드려요.<br />
            지금 목표를 설정하면 바로 확인할 수 있어요.
            <template #action>
              <RouterLink class="state-card__cta" to="/diagnosis">목표 설정하러 가기</RouterLink>
            </template>
          </StateNoticeCard>

          <p v-else-if="activeStatus === 'loading'" class="compare-view__notice">불러오는 중...</p>

          <p v-else-if="activeStatus === 'error'" class="compare-view__notice">
            {{ activeErrorMessage || '비교 결과를 불러오지 못했어요. 잠시 후 다시 시도해주세요.' }}
          </p>

          <StateNoticeCard
            v-else-if="activeStatus === 'no-asset'"
            eyebrow="자산 연동 필요"
            variant="wait"
            title="자산을 연동하면 비교해드릴게요"
          >
            또래 비교는 순자산이 비슷한 사람끼리 묶어서 보여드려요.<br />
            자산을 연동하면 바로 결과를 볼 수 있어요.
            <template #action>
              <button type="button" class="state-card__cta" @click="goToAdditionalAssetLink">
                자산 연동하러 가기
              </button>
            </template>
          </StateNoticeCard>

          <CohortInsufficientNotice
            v-else-if="activeStatus === 'insufficient' && activeComparison"
            :cohort-size="activeComparison.cohort.cohortSize ?? 0"
            :minimum-required="activeComparison.cohort.minimumRequired"
            :can-widen="canWidenCohort"
            :applied-filters="appliedFilters"
            @widen="isEditOpen = true"
          />

          <template v-else-if="activeStatus === 'ready' && activeComparison">
            <CohortConditionCard
              :cohort-size="activeComparison.cohort.cohortSize"
              :applied-filters="appliedFilters"
              :asset-range-label="`자산 ±${formatManwon(activeComparison.cohort.assetRange)}`"
              :age-range-label="`나이 ±${activeComparison.cohort.ageRange}세`"
              @edit="isEditOpen = true"
            />

            <template v-if="activeTab === 'asset'">
              <NetAssetHighlightCard
                class="card--cream"
                :cohort-average-net-assets="activeComparison.cohortAverageNetAssets"
              />

              <IncomeBracketDistributionCard
                v-if="showIncomeDistribution"
                class="card--mint"
                :brackets="activeComparison.incomeBracketDistribution"
                :my-income-bracket="memberStore.profile?.incomeBracket ?? null"
              />

              <OccupationDistributionCard
                v-if="showOccupationDistribution && activeComparison.occupationDistribution?.length"
                class="card--cream"
                :items="activeComparison.occupationDistribution"
                :my-occupation-type="memberStore.profile?.occupationType ?? null"
              />

              <SavingRangeCard
                v-if="activeComparison.saving?.mine != null"
                class="card--mint"
                :my-monthly-saving="activeComparison.saving.mine"
                :cohort-range-min="activeComparison.saving.cohortMin"
                :cohort-range-max="activeComparison.saving.cohortMax"
              />
              <StateNoticeCard
                v-else
                eyebrow="목표 설정 필요"
                variant="wait"
                title="목표를 세우면 저축 계획도 비교할 수 있어요"
              >
                어떤 목표로 얼마씩 모으고 있는지 또래와 비교해보세요.
                <template #action>
                  <RouterLink class="state-card__cta" to="/diagnosis"
                    >목표 설정하러 가기</RouterLink
                  >
                </template>
              </StateNoticeCard>
            </template>

            <template v-else>
              <AchievementHistogramCard
                class="card--cream"
                :my-rate="activeComparison.achievement.mine"
                :cohort-average-rate="activeComparison.achievement.cohortAverage"
                :buckets="activeComparison.achievement.buckets"
              />

              <div class="stat-pair">
                <div class="stat-card card--mint">
                  <div class="stat-card__label">평균 목표 자산</div>
                  <div class="stat-card__value">
                    {{ formatEokManwon(activeComparison.averageTargetAmount) }}
                  </div>
                </div>
                <div class="stat-card card--mint">
                  <div class="stat-card__label">평균 준비 기간</div>
                  <div class="stat-card__value">
                    {{ formatPrepPeriod(activeComparison.averagePrepMonths) }}
                  </div>
                </div>
              </div>

              <DealTypeDistributionCard
                v-if="activeComparison.dealTypeDistribution.length"
                class="card--cream"
                :top-deal-type="activeComparison.dealTypeDistribution[0].label"
                :top-deal-ratio="activeComparison.dealTypeDistribution[0].ratio"
                :items="activeComparison.dealTypeDistribution"
              />

              <PopularRegionsCard class="card--mint" :regions="activeComparison.popularRegions" />
            </template>

            <div class="disclaimer">
              <p class="disclaimer__title">🔒 개인정보 보호</p>
              <p class="disclaimer__body">
                개별 목표·자산은 노출되지 않으며 집계 데이터만 사용돼요.
              </p>
            </div>
          </template>
        </div>
      </Transition>
    </template>

    <Transition name="sheet">
      <CohortEditSheet
        v-if="isEditOpen"
        :asset-range="assetRange"
        :age-range="ageRange"
        :cohort-types="cohortTypes"
        :has-income-info="hasIncomeInfo"
        :has-occupation-info="hasOccupationInfo"
        @apply="handleApplyCohort"
        @close="isEditOpen = false"
      />
    </Transition>
  </div>
</template>

<style scoped>
/*
  비교 화면 색을 여기 한 곳에 모은다. CSS 변수는 scoped 여부와 상관없이
  자식 컴포넌트까지 내려가므로, 카드들은 이 이름만 가져다 쓴다.

  다크는 원래 비교 화면 색을 그대로 둔다(민트·골드).
  라이트만 main.css의 공용 테마 토큰에 붙인다. 마이페이지에서 토글하면
  이 화면도 같이 바뀐다. main.css는 건드리지 않는다.
*/
.compare-view {
  --c-bg: #111111;
  --c-card: #171b16;
  --c-line: #334234;
  --c-ink: #e8f0e6;
  --c-ink-muted: #7fa398;
  --c-ink-faint: #7f8a7d;
  --c-accent: #9fd8ab;
  --c-accent-mid: #4f7a5c;
  --c-accent-soft: #263029;
  --c-track: #263029;
  --c-box: #171b16;
  /* 내 값·순위처럼 눈에 먼저 들어와야 하는 숫자. 다크에서만 금색을 쓴다. */
  --c-value: #ffd939;
  --c-badge-bg: #ffd939;
  --c-badge-ink: #171b16;
  --c-on-accent: #16281c;
  --c-tooltip-bg: #1c1c1c;
  --c-warn: #ffd939;
  --c-warn-bg: rgba(255, 217, 57, 0.16);
  --c-danger: #e37a63;
  --c-danger-soft: rgba(193, 68, 46, 0.16);

  /*
    다크에서 카드는 크림·민트 두 가지 색을 번갈아 쓴다(홈 화면과 같은 팔레트).
    색 있는 카드 위에서는 글씨와 막대 색이 달라져야 해서 한 벌 더 둔다.
    라이트에서는 아래 [data-theme='light'] 블록이 전부 흰 카드로 되돌린다.
  */
  --c-card-cream: #f7ffd1;
  --c-card-mint: #cdedd3;
  --c-on-color-ink: #16281c;
  --c-on-color-muted: #456351;
  --c-on-color-faint: #5f7a68;
  --c-on-color-line: rgba(22, 40, 28, 0.14);
  --c-on-color-accent: #1d6b3f;
  --c-on-color-accent-mid: #8fb59a;
  --c-on-color-soft: rgba(22, 40, 28, 0.08);
  --c-on-color-track: rgba(22, 40, 28, 0.12);
  --c-on-color-value: #16281c;

  /* 맨 아래 안내 상자. 읽고 넘어가는 문구라 양쪽 테마 모두 배경보다 살짝만 밝게 둔다. */
  /* 잠금 화면 안내 상자처럼 옅은 바탕이 필요한 곳 */
  --c-pale-bg: #9fd8ab;
  --c-pale-ink: #16281c;

  --c-disclaimer-bg: #1b1f1a;
  --c-disclaimer-ink: #e8f0e6;
  --c-disclaimer-body: #7fa398;
  /*
    앱 배경이 아직 테마를 따라가지 않아 이 화면만 직접 칠한다. MobileLayout의
    여백(16px 16px 96px)을 음수 마진으로 상쇄한 뒤 같은 값을 다시 준다.
    레이아웃이 배경을 칠해주게 되면 이 세 줄은 지우면 된다.
  */
  margin: -16px -16px -96px;
  padding: 16px 16px 96px;
  background: var(--c-bg);

  display: flex;
  flex-direction: column;
  gap: 10px;
  line-height: 1.45;
}

:root[data-theme='light'] .compare-view {
  --c-bg: var(--color-app-bg);
  --c-card: var(--color-surface);
  --c-line: var(--color-border);
  --c-ink: var(--color-text-primary);
  /*
    카드 설명 글 색. 디자인에서 지정한 값이라 공용 토큰 대신 직접 쓴다.
    흰 카드에서 6.2:1, 앱 배경에서 5.8:1로 기준(4.5:1)을 넘는다.
  */
  --c-ink-muted: #5b6358;
  /*
    공용 --color-text-tertiary(#8f968c)는 흰 카드에서 대비가 3.04:1로 기준(4.5:1)에
    못 미친다. 여기 쓰이는 곳이 10~11px 작은 글씨라 더 불리해서 한 단계 진하게 쓴다.
  */
  --c-ink-faint: #6f7a6d;
  /*
    --color-primary는 라이트·다크가 같은 진초록(#1d6b3f)이라 배경 위에서 안 보인다.
    테마별로 뒤집히는 --color-heading-accent를 쓴다.
  */
  --c-accent: var(--color-heading-accent);
  /*
    공용 --color-progress-inactive는 "게이지 빈 칸"용 회색(라이트 #e3e7e0)으로 바뀌었다.
    여기서 필요한 건 보조 막대·띠에 쓰는 중간 톤 초록이라 뜻이 달라서 값을 직접 쓴다.
  */
  --c-accent-mid: #a9c9b0;
  --c-accent-soft: #e8f4ea;
  --c-track: #eff1eb;
  --c-box: #e8ebe4;
  --c-value: var(--color-heading-accent);
  --c-badge-bg: #e8f4ea;
  --c-badge-ink: var(--color-heading-accent);
  --c-on-accent: #ffffff;
  --c-tooltip-bg: #10130f;
  --c-warn: #7a6000;
  --c-warn-bg: #f4efdc;
  --c-danger: #c1442e;
  --c-danger-soft: rgba(193, 68, 46, 0.1);

  /* 라이트에서는 색 카드가 없다. 전부 흰 카드로 되돌린다. */
  --c-card-cream: var(--color-surface);
  --c-card-mint: var(--color-surface);
  --c-on-color-ink: var(--color-text-primary);
  /* 라이트에서 색 카드는 흰 카드라 위 --c-ink-muted와 같은 값을 쓴다. */
  --c-on-color-muted: #5b6358;
  /* 라이트에서 색 카드는 흰 카드라 위 --c-ink-faint와 같은 값을 써야 대비가 유지된다. */
  --c-on-color-faint: #6f7a6d;
  --c-on-color-line: var(--color-border);
  --c-on-color-accent: var(--color-heading-accent);
  --c-on-color-accent-mid: #a9c9b0;
  --c-on-color-soft: #e8f4ea;
  --c-on-color-track: #eff1eb;
  --c-on-color-value: var(--color-heading-accent);

  --c-pale-bg: #e8f4ea;
  --c-pale-ink: var(--color-heading-accent);

  --c-disclaimer-bg: #e8ebe4;
  --c-disclaimer-ink: var(--color-text-primary);
  --c-disclaimer-body: var(--color-text-secondary);
}

/*
  색 카드는 배경만 다른 게 아니라 그 위의 글씨·막대 색도 함께 바뀌어야 한다.
  카드 컴포넌트를 고치는 대신, 이 화면에서 클래스를 얹어 변수만 갈아 끼운다.
  변수는 자식까지 내려가므로 카드 안쪽 요소들이 알아서 따라온다.
*/
.compare-view :deep(.card--cream),
.compare-view :deep(.card--mint) {
  --c-ink: var(--c-on-color-ink);
  --c-ink-muted: var(--c-on-color-muted);
  --c-ink-faint: var(--c-on-color-faint);
  --c-line: var(--c-on-color-line);
  --c-accent: var(--c-on-color-accent);
  --c-accent-mid: var(--c-on-color-accent-mid);
  --c-accent-soft: var(--c-on-color-soft);
  --c-track: var(--c-on-color-track);
  --c-value: var(--c-on-color-value);
  --c-box: var(--c-on-color-soft);
}

.compare-view :deep(.card--cream) {
  --c-card: var(--c-card-cream);
}

.compare-view :deep(.card--mint) {
  --c-card: var(--c-card-mint);
}

.compare-view__subheader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 10px 0 6px;
  text-align: center;
}

.compare-view__subheader p {
  margin: 0;
  font-size: 11.5px;
  color: var(--c-ink-muted);
}

.compare-view__desc {
  margin-top: 2px;
}

.compare-view__stale {
  display: inline-flex;
  padding: 2px 9px;
  border-radius: 999px;
  background: var(--c-warn-bg);
  color: var(--c-warn);
  font-size: 10.5px;
  font-weight: 600;
}

.compare-view__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}

.compare-view__notice {
  padding: 24px 0;
  text-align: center;
  font-size: 13px;
  color: var(--c-ink-muted);
}

.tab-fade-enter-active,
.tab-fade-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
}

.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.stat-pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.stat-card {
  --ink-muted: var(--c-ink-muted);

  border: 1px solid var(--c-line);
  border-radius: 14px;
  background: var(--c-card);
  padding: 14px;
  animation: card-rise 0.35s ease-out both;
  animation-delay: 0.12s;
}

.stat-card__label {
  font-size: 12px;
  font-weight: 700;
  color: var(--c-ink);
}

.stat-card__value {
  margin-top: 2px;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--c-value);
  font-variant-numeric: tabular-nums;
}

.disclaimer {
  --surface: var(--c-disclaimer-bg);
  --body: var(--c-disclaimer-body);

  margin: 4px 0;
  padding: 9px 14px;
  border-radius: 12px;
  background: var(--surface);
  border: none;
  text-align: center;
  font-size: 11px;
  line-height: 1.5;
  color: var(--body);
  animation: card-rise 0.35s ease-out both;
  animation-delay: 0.3s;
}

.disclaimer__title {
  margin: 0;
  font-weight: 700;
  color: var(--c-disclaimer-ink);
}

.disclaimer__body {
  margin: 3px 0 0;
}

.state-card__cta {
  margin-top: 12px;
  display: inline-flex;
  align-items: center;
  padding: 8px 15px;
  border: none;
  border-radius: 999px;
  background: var(--c-accent);
  color: var(--c-on-accent);
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}
</style>
