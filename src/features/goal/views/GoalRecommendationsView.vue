<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppHeader from '@/shared/components/molecules/AppHeader.vue'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'
import BaseSkeleton from '@/shared/components/atoms/feedback/Skeleton/BaseSkeleton.vue'
import BaseEmptyState from '@/shared/components/atoms/feedback/EmptyState/BaseEmptyState.vue'

import RecommendationCard from '@/features/goal/components/RecommendationCard.vue'
import { useGoalStore } from '@/features/goal/store/goalStore'
import { groupRecommendationsForResult } from '@/features/goal/utils/recommendationViewModel'

const SKELETON_CARD_COUNT = 4

// 결과 상세 화면의 라우트 이름. 상세 화면은 별도로 작업 중이라 아직 라우터에 등록되어 있지
// 않다. 등록되는 순간 이 화면은 고칠 것 없이 그대로 이어진다 — 카드가 들고 있는 recommendation
// 전체(type/title/reason/condition/loanX/loanO)는 goalStore.recommendations에 그대로 있다.
const DETAIL_ROUTE_NAME = 'goal-recommendation-detail'

const router = useRouter()
const goalStore = useGoalStore()

// "희망 조건을 기준으로"(PREFERENCE_SAVING_FIXED/PREFERENCE_DATE_FIXED)와 "다른 선택지도
// 살펴보세요"(REALISTIC/HOLD_OUT) 두 그룹. 정렬·비교 가능 여부 필터링은 viewModel 쪽에서
// 끝내므로 여기서는 그룹별로 렌더링만 한다. PREFERENCE_DATE_FIXED처럼 응답에 아예 없는 type은
// 자연스럽게 그 그룹에서 빠진다(빈 카드나 placeholder를 만들지 않는다).
const recommendationGroups = computed(() =>
  groupRecommendationsForResult(goalStore.recommendations),
)
const hasAnyRecommendation = computed(
  () =>
    recommendationGroups.value.preferenceGroup.length > 0 ||
    recommendationGroups.value.otherGroup.length > 0,
)

// 진단 직후 결과 화면에 "처음" 들어왔을 때만 안내 문구가 중앙에서 나타나 상단으로 이동하는
// 인트로를 재생한다. store의 playResultIntro는 여기서 값을 읽자마자 바로 소비(false로 되돌림)
// 해, 상세 화면을 오가는 이후 재진입에서는 절대 다시 켜지지 않게 한다 — 그 경우는 기존 카드
// 애니메이션(goal-recommendations-view--animated)만 그대로 탄다.
const playIntro = ref(goalStore.playResultIntro)
goalStore.playResultIntro = false

// 모션 감소를 켠 사용자에게는 새 인트로를 재생하지 않고 최종 상태를 즉시 보여준다.
const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// 안내 문구의 2단계 모션(중앙 쪽에서 fade-in → 상단으로 이동) 트리거. 데이터 로딩이 끝나
// 카드까지 그릴 수 있는 상태가 된 뒤에만 켠다(로딩 중·에러·빈 결과에서는 재생하지 않는다).
const introActive = ref(false)

onMounted(async () => {
  await goalStore.loadRecommendationResult()

  if (!playIntro.value || !hasAnyRecommendation.value || prefersReducedMotion) {
    // 인트로를 재생하지 않는 모든 경우 — 재진입/로딩 실패/빈 결과/모션 감소 — 는 기존
    // --animated 카드 애니메이션만 타면 되므로 여기서 끈다.
    playIntro.value = false
    return
  }

  // 초기(opacity:0) 상태가 먼저 한 프레임 그려진 뒤에 활성 클래스를 붙여야 transition이
  // 정상적으로 시작점을 잡는다 — 같은 tick에 붙이면 브라우저가 전환을 생략하고 바로
  // 최종 상태로 그릴 수 있다.
  await nextTick()
  requestAnimationFrame(() => {
    introActive.value = true
  })
})

async function goToDetail(recommendation) {
  try {
    // 이름이 등록되지 않은 라우트로 push하면 반환된 Promise가 아니라 호출 시점에 동기적으로
    // 던져지므로, .catch() 체이닝이 아니라 try/catch로 감싸야 한다
    // (GoalConditionStepsView.submit()과 동일한 패턴).
    await router.push({ name: DETAIL_ROUTE_NAME, params: { type: recommendation.type } })
  } catch {
    // 상세 화면 라우트가 아직 없으면 이동에 실패한다. 이때 화면이 멈춘 것처럼 보이지 않도록
    // 현재 목록 화면에 그대로 머문 채 개발자에게만 알린다.
    console.error(
      `[goal] '${DETAIL_ROUTE_NAME}' 라우트가 아직 등록되지 않았습니다. 추천 상세 화면을 라우터에 추가해주세요.`,
    )
  }
}

function goToDiagnosis() {
  /*
    이 화면은 뒤로가기 버튼(show-back=false)도 하단 탭(HIDDEN_NAV_ROUTE_NAMES)도 없다.
    push로 쌓으면 조건 입력 첫 화면에서 뒤로 갔을 때 여기로 되돌아와 사용자가 갇힌다.

    replace라서 이 결과 화면이 히스토리에서 빠지고, 그 자리를 조건 입력 화면이 대신한다.
    앱 헤더의 뒤로가기뿐 아니라 브라우저·OS의 뒤로가기도 결과 화면을 건너뛰고 홈으로 간다
    (헤더 버튼만 고치면 브라우저 뒤로가기로는 여전히 갇힌다).

    state의 fromDiagnosisResult는 헤더 뒤로가기를 홈으로 명시해 보내기 위한 표시다. 히스토리
    모양에 기대지 않고 목적지를 코드로 정해두려는 것이고, 주소창에는 남지 않아서 /diagnosis를
    직접 열거나 새로고침한 경우의 동작은 그대로다.
  */
  router.replace({ name: 'diagnosis', state: { fromDiagnosisResult: true } })
}
</script>

<template>
  <div
    class="goal-recommendations-view"
    :class="{
      'goal-recommendations-view--animated': hasAnyRecommendation && !playIntro,
      'goal-recommendations-view--intro': hasAnyRecommendation && playIntro,
    }"
  >
    <AppHeader title="진단 결과" :show-back="false" />

    <div
      class="goal-recommendations-view__intro"
      :class="{ 'goal-recommendations-view__intro--active': introActive }"
    >
      <h2 class="goal-recommendations-view__title">나에게 맞는 주거 계획을 비교해보세요</h2>
      <p class="goal-recommendations-view__description">
        같은 희망 조건도 준비 방법에 따라
        <br />도달 시점과 필요한 저축액이 달라질 수 있어요.
      </p>
      <!-- 카드마다 예상 시세를 반복해서 보여주진 않지만, 추천 계산에 현재 시세가 아니라
           도달 시점의 예상 시세가 쓰였다는 사실만은 짧게 알려준다. -->
      <p class="goal-recommendations-view__notice">
        주거 시세는 실거래 데이터를 바탕으로 도달 시점의 예상 가격을 반영했어요.
      </p>
    </div>

    <ul v-if="goalStore.isRecommending" class="goal-recommendations-view__list">
      <li v-for="n in SKELETON_CARD_COUNT" :key="n">
        <BaseSkeleton height="220px" radius="16px" />
      </li>
    </ul>

    <div v-else-if="goalStore.recommendError" class="goal-recommendations-view__state">
      <BaseEmptyState message="추천 결과를 불러오지 못했어요. 잠시 후 다시 시도해주세요." />
      <BaseButton size="lg" @click="goalStore.loadRecommendationResult">다시 시도</BaseButton>
    </div>

    <div v-else-if="!hasAnyRecommendation" class="goal-recommendations-view__state">
      <BaseEmptyState message="조건에 맞는 계획을 찾지 못했어요." />
      <BaseButton
        variant="secondary"
        size="lg"
        class="goal-recommendations-view__retry"
        @click="goToDiagnosis"
      >
        다시 진단하기
      </BaseButton>
    </div>

    <template v-else>
      <template v-if="recommendationGroups.preferenceGroup.length > 0">
        <p class="goal-recommendations-view__group-label">희망 조건을 기준으로</p>
        <ul class="goal-recommendations-view__list">
          <li
            v-for="recommendation in recommendationGroups.preferenceGroup"
            :key="recommendation.type"
          >
            <RecommendationCard :recommendation="recommendation" @select="goToDetail" />
          </li>
        </ul>
      </template>

      <template v-if="recommendationGroups.otherGroup.length > 0">
        <p
          class="goal-recommendations-view__group-label goal-recommendations-view__group-label--secondary"
        >
          다른 선택지도 살펴보세요
        </p>
        <ul class="goal-recommendations-view__list">
          <li v-for="recommendation in recommendationGroups.otherGroup" :key="recommendation.type">
            <RecommendationCard :recommendation="recommendation" @select="goToDetail" />
          </li>
        </ul>
      </template>

      <BaseButton
        variant="secondary"
        size="lg"
        class="goal-recommendations-view__retry"
        @click="goToDiagnosis"
      >
        다시 진단하기
      </BaseButton>
    </template>
  </div>
</template>

<style scoped>
.goal-recommendations-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 32px;
}

.goal-recommendations-view__intro {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin: 1px 0 4px;
  text-align: center;
}

.goal-recommendations-view__title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: -0.5px;
  color: var(--color-text-primary, #ffffff);
}

.goal-recommendations-view__description {
  margin: 0;
  font-size: 13.2px;
  line-height: 1.6;
  color: var(--color-text-secondary, #9aa09a);
}

/* description보다 우선순위가 낮은 부가 안내라 한 단계 더 옅고 작게 둔다 */
.goal-recommendations-view__notice {
  margin: 2px 0 0;
  font-size: 11.5px;
  line-height: 1.5;
  color: var(--color-text-tertiary, #6f766d);
}

/*
  "희망 조건을 기준으로" / "다른 선택지도 살펴보세요" 그룹 제목. 카드 제목(20px/700)만큼
  크게 만들지 않고, 새 배경 box나 큰 섹션 card 없이 muted한 한 줄 텍스트로만 구분한다.
  바로 아래 카드 목록과는 살짝 붙여(음수 margin-bottom) 하나의 그룹으로 읽히게 한다.
*/
.goal-recommendations-view__group-label {
  margin: 0 0 -4px;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-secondary, #9aa09a);
}

/* 두 번째 그룹은 카드 목록 사이 간격(16px)보다 조금 더 크게 띄워, 앞 그룹과 구분되는
   섹션임을 spacing만으로 드러낸다. */
.goal-recommendations-view__group-label--secondary {
  margin-top: 12px;
}

.goal-recommendations-view__list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.goal-recommendations-view__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding-top: 16px;
}

/*
  Primary(추천 카드 선택)보다 한 단계 낮은 Secondary CTA. 연한 초록 배경 + 진한 초록
  텍스트로 클릭 가능함은 분명히 하되, border를 넣으면 outline 버튼처럼 딱딱해 보여서
  아주 약한 shadow로만 배경과의 경계를 부드럽게 잡아준다.
*/
.goal-recommendations-view__retry {
  margin-top: 4px;
  background: var(--color-primary-soft, #e8f4ea);
  color: var(--color-primary, #1d6b3f);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition:
    background-color 0.15s ease,
    box-shadow 0.15s ease;
}

/* 텍스트 색은 그대로 두고 배경만 한 톤 진하게, shadow도 아주 살짝만 키운다.
   터치 기기에서 탭 후에도 hover가 눌어붙지 않도록 실제 hover 가능한 입력에서만 적용한다. */
@media (hover: hover) and (pointer: fine) {
  .goal-recommendations-view__retry:hover {
    background: var(--color-primary-soft-hover, #c2dec7);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  }
}

/*
  홈/비교/목표 상세 화면과 같은 card-rise 진입 모션(main.css에 공용 정의)을 재사용한다.
  로딩/에러/빈 상태에는 적용하지 않고, 실제 추천 목록이 준비된 뒤에만(v-else 분기) 애니메이션이
  실행되게 sortedRecommendations.length로 게이트를 건다(GoalDetailView의 `detail` 게이트와 동일한 방식).
*/
.goal-recommendations-view--animated > * {
  animation: card-rise 0.35s ease-out both;
}

.goal-recommendations-view--animated > *:nth-child(2) {
  animation-delay: 0.06s;
}

.goal-recommendations-view--animated > *:nth-child(3) {
  animation-delay: 0.12s;
}

.goal-recommendations-view--animated > *:nth-child(4) {
  animation-delay: 0.18s;
}

.goal-recommendations-view--animated > *:nth-child(5) {
  animation-delay: 0.24s;
}

.goal-recommendations-view--animated > *:nth-child(6) {
  animation-delay: 0.3s;
}

.goal-recommendations-view--animated > *:nth-child(7) {
  animation-delay: 0.36s;
}

/*
  진단을 마치고 결과 화면에 "처음" 들어왔을 때만 켜지는 인트로(goal-recommendations-view--intro).
  기존 --animated와는 완전히 분리해뒀다 — 상세 화면을 오가는 재진입에서는 항상 --animated만
  붙고, 최초 진입에서는 이쪽만 붙는다(둘이 동시에 켜지지 않는다).

  안내 문구(__intro)는 아래 두 클래스로 "중앙 쪽에서 옅게 시작 → 상단 제자리로 이동"을
  표현한다. 최종 레이아웃 자리는 처음부터 그대로 차지하고(문서 흐름은 건드리지 않음)
  opacity/transform만 바꿔 layout shift 없이 움직인다.
*/
.goal-recommendations-view--intro .goal-recommendations-view__intro {
  opacity: 0;
  transform: translateY(110px);
  transition:
    opacity 0.3s ease-out,
    transform 0.32s ease-out 0.26s;
}

.goal-recommendations-view--intro .goal-recommendations-view__intro--active {
  opacity: 1;
  transform: translateY(0);
}

/*
  안내 문구가 상단에 자리잡기 시작할 무렵부터 그 아래(section label/카드 목록/다시
  진단하기)가 순차적으로 올라온다. --animated와 같은 card-rise를 그대로 재사용하되,
  이 화면에 실제로 렌더링된 자식 순서(nth-child) 기준으로 delay만 더 늦고 넓은 간격으로 준다
  — PREFERENCE_DATE_FIXED처럼 없는 카드는 애초에 그 자리에 렌더링되지 않으므로 뒤 항목들이
  자연스럽게 한 칸씩 당겨져, 빈 딜레이 구간이 생기지 않는다.
*/
.goal-recommendations-view--intro > :nth-child(n + 3) {
  animation: card-rise 0.4s ease-out both;
  animation-delay: 0.52s;
}

.goal-recommendations-view--intro > :nth-child(4) {
  animation-delay: 0.6s;
}

.goal-recommendations-view--intro > :nth-child(5) {
  animation-delay: 0.68s;
}

.goal-recommendations-view--intro > :nth-child(6) {
  animation-delay: 0.76s;
}

.goal-recommendations-view--intro > :nth-child(7) {
  animation-delay: 0.84s;
}

/* 모션 감소 사용자는 JS에서 이미 --intro 자체를 붙이지 않지만(playIntro를 끔), 혹시라도
   이 상태로 렌더링되는 경우를 대비해 CSS에서도 한 번 더 막아 콘텐츠 노출을 지연시키지 않는다. */
@media (prefers-reduced-motion: reduce) {
  .goal-recommendations-view--intro .goal-recommendations-view__intro,
  .goal-recommendations-view--intro > :nth-child(n + 3) {
    opacity: 1;
    transform: none;
    transition: none;
    animation: none;
  }
}
</style>
