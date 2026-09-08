<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppHeader from '@/shared/components/molecules/AppHeader.vue'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'
import BaseSkeleton from '@/shared/components/atoms/feedback/Skeleton/BaseSkeleton.vue'
import BaseEmptyState from '@/shared/components/atoms/feedback/EmptyState/BaseEmptyState.vue'

import RecommendationHousingCard from '@/features/goal/components/RecommendationHousingCard.vue'
import RecommendationCompareCard from '@/features/goal/components/RecommendationCompareCard.vue'
import RecommendationFundingCard from '@/features/goal/components/RecommendationFundingCard.vue'
import GoalConfirmModal from '@/features/goal/components/GoalConfirmModal.vue'
import { useGoalStore } from '@/features/goal/store/goalStore'
import {
  RECOMMENDATION_TITLE_MAP,
  toRecommendationDescription,
  toCompareCardViewModel,
  toGoalCreationPayload,
} from '@/features/goal/utils/recommendationViewModel'

const RESULT_ROUTE_NAME = 'goal-recommendations'

const props = defineProps({
  type: { type: String, required: true },
})

const router = useRouter()
const goalStore = useGoalStore()
const isConfirmOpen = ref(false)

// 목록 화면에서 방금 눌러 들어온 정상 흐름이면 store에 이미 있어 바로 렌더링된다.
// 새로고침/직접 진입이라 store가 비어 있으면 onMounted에서 다시 불러온다.
const recommendation = computed(
  () => goalStore.recommendations.find((item) => item.type === props.type) ?? null,
)

const title = computed(() => RECOMMENDATION_TITLE_MAP[props.type] ?? recommendation.value?.title)
const description = computed(() => toRecommendationDescription(recommendation.value))

// PREFERENCE_SAVING_FIXED/PREFERENCE_DATE_FIXED/HOLD_OUT만 "핵심 카드"가 있다. REALISTIC은
// 추천된 주거 조건 자체가 핵심 결과라 이 카드를 따로 두지 않는다(null이면 화면에서 자동으로
// 빠진다). HOLD_OUT은 같은 응답 안의 REALISTIC과 비교해야 해서 전체 목록도 함께 넘긴다.
const compareView = computed(() =>
  toCompareCardViewModel(recommendation.value, goalStore.recommendations),
)

onMounted(() => {
  if (!recommendation.value) goalStore.loadRecommendationResult()
})

// 실제 저장은 여기서 바로 하지 않고, 어떤 값이 저장되는지 확인 + 대출 없이/활용 최종
// 선택을 하는 팝업을 먼저 연다. 저장 자체는 팝업의 "목표 설정하기"에서 호출한다.
function handleSetAsGoal() {
  isConfirmOpen.value = true
}

async function confirmAndSaveGoal(planKey) {
  const plan = recommendation.value[planKey]
  const saved = await goalStore.saveGoal(toGoalCreationPayload(recommendation.value, plan))
  if (!saved) return
  isConfirmOpen.value = false
  router.push({ name: 'home' })
}

function goToRecommendations() {
  router.push({ name: RESULT_ROUTE_NAME })
}
</script>

<template>
  <div
    class="recommendation-detail-view"
    :class="{ 'recommendation-detail-view--animated': recommendation }"
  >
    <AppHeader @back="router.back()" />

    <div v-if="goalStore.isRecommending" class="recommendation-detail-view__skeleton">
      <BaseSkeleton height="56px" radius="16px" />
      <BaseSkeleton height="160px" radius="16px" />
      <BaseSkeleton height="120px" radius="16px" />
      <BaseSkeleton height="280px" radius="16px" />
    </div>

    <div v-else-if="goalStore.recommendError" class="recommendation-detail-view__state">
      <BaseEmptyState message="계획을 불러오지 못했어요. 잠시 후 다시 시도해주세요." />
      <BaseButton size="lg" @click="goalStore.loadRecommendationResult">다시 시도</BaseButton>
    </div>

    <div v-else-if="!recommendation" class="recommendation-detail-view__state">
      <BaseEmptyState message="계획을 찾을 수 없어요." />
      <BaseButton size="lg" @click="router.back()">진단 결과로 돌아가기</BaseButton>
    </div>

    <template v-else>
      <div class="recommendation-detail-view__intro">
        <h2 class="recommendation-detail-view__title">{{ title }}</h2>
        <p class="recommendation-detail-view__description">{{ description }}</p>
      </div>

      <div class="recommendation-detail-view__cards">
        <RecommendationHousingCard
          :condition="recommendation.condition"
          :target-date="recommendation.loanX.targetDate"
        />
        <RecommendationCompareCard
          v-if="compareView"
          :title="compareView.title"
          :rows="compareView.rows"
        />
        <RecommendationFundingCard
          :loan-x="recommendation.loanX"
          :loan-o="recommendation.loanO"
          :type="recommendation.type"
        />
      </div>

      <div class="recommendation-detail-view__footer">
        <BaseButton size="lg" @click="handleSetAsGoal"> 이 계획으로 목표 설정하기 </BaseButton>
        <button
          type="button"
          class="recommendation-detail-view__compare"
          @click="goToRecommendations"
        >
          다른 계획 비교하기
        </button>
      </div>

      <GoalConfirmModal
        v-model="isConfirmOpen"
        :recommendation="recommendation"
        :is-saving="goalStore.isSaving"
        :save-error="goalStore.saveError"
        @confirm="confirmAndSaveGoal"
      />
    </template>
  </div>
</template>

<style scoped>
.recommendation-detail-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
  /* 하단 CTA(__footer)가 fixed라 문서 흐름에서 빠지므로, 마지막 카드가 CTA에 가려지지
     않도록 그 높이(버튼 53px + 텍스트 액션 + 상하 패딩)만큼 여유를 미리 확보해둔다. */
  padding-bottom: 140px;
}

.recommendation-detail-view__skeleton {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recommendation-detail-view__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding-top: 16px;
}

.recommendation-detail-view__intro {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 8px 0 4px;
}

.recommendation-detail-view__title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: -0.5px;
  color: var(--color-text-primary, #ffffff);
}

.recommendation-detail-view__description {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-text-secondary, #9aa09a);
}

.recommendation-detail-view__cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/*
  이 화면은 카드가 여러 개라 뷰포트보다 콘텐츠가 길어질 수 있다. position:sticky는 그 경우
  아직 스크롤하지 않은 카드 중간 위에 CTA가 얹혀 겹쳐 보인다(스크롤 컨테이너가 body 전체라
  "끝까지 스크롤해야 자연스럽게 마지막에 붙는" sticky 특유의 여유 공간이 없기 때문).
  하단 탭바(.mobile-layout__nav)와 같은 방식으로 position:fixed + 같은 폭 계산을 써서
  화면 어디를 보고 있든 항상 같은 자리에 고정한다.
*/
.recommendation-detail-view__footer {
  position: fixed;
  left: 50%;
  bottom: 0;
  z-index: 4;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: calc(100% - 32px);
  max-width: 368px;
  padding: 12px 0 calc(12px + env(safe-area-inset-bottom, 0px));
  background: var(--color-app-bg, #111111);
  transform: translateX(-50%);
}

/* 주 CTA(BaseButton)와 위계가 확실히 구분되도록, 배경 없는 텍스트 액션으로만 둔다. */
.recommendation-detail-view__compare {
  border: 0;
  padding: 4px;
  background: none;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-primary, #1d6b3f);
  text-decoration: underline;
  cursor: pointer;
}

/*
  홈/비교/목표 상세 화면과 같은 card-rise 진입 모션(main.css에 공용 정의)을 재사용한다.
  로딩/에러/찾을 수 없음 상태에는 적용하지 않고, recommendation을 실제로 찾은 뒤에만
  (v-else 분기) 애니메이션이 실행되게 게이트를 건다(GoalDetailView의 `detail` 게이트와 동일).
  __footer는 제외한다 — card-rise가 쓰는 transform(translateY)이 footer 자신의 가운데 정렬용
  transform(translateX(-50%))을 덮어써서 애니메이션이 끝난 뒤에도 정렬이 깨진 채로 남는다.
*/
.recommendation-detail-view--animated > *:not(.recommendation-detail-view__footer) {
  animation: card-rise 0.35s ease-out both;
}

.recommendation-detail-view--animated > *:nth-child(2) {
  animation-delay: 0.06s;
}

.recommendation-detail-view--animated > *:nth-child(3) {
  animation-delay: 0.12s;
}

.recommendation-detail-view--animated > *:nth-child(4) {
  animation-delay: 0.18s;
}

.recommendation-detail-view--animated > *:nth-child(5) {
  animation-delay: 0.24s;
}
</style>
