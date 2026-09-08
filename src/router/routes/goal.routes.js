import {
  GoalConditionStepsView,
  GoalRecommendationsView,
  RecommendationDetailView,
  GoalDetailView,
  GoalEmptyView,
} from '@/features/goal'

export const goalRoutes = [
  // 목표 생성은 조건을 한 화면에 하나씩 묻는 단계별 플로우로 받는다(추천 API 호출).
  // 라우트 이름은 'diagnosis' 그대로 둔다 — MobileLayout의 하단 탭 숨김 목록과
  // 홈/목표 빈 화면의 '/diagnosis' 이동이 이 이름·경로를 참조하고 있다.
  { path: 'diagnosis', name: 'diagnosis', component: GoalConditionStepsView },
  // 조건 입력을 마치면 이동하는 진단 결과(추천 계획 비교) 화면. 라우트 이름은
  // GoalConditionStepsView가 이미 참조하고 있는 'goal-recommendations' 그대로 쓴다.
  {
    path: 'goals/recommendations',
    name: 'goal-recommendations',
    component: GoalRecommendationsView,
  },
  // 추천 카드를 눌렀을 때 이동하는 상세 화면. GoalRecommendationsView.goToDetail()이
  // 이미 이 라우트 이름을 참조하고 있었다 — 라우트가 등록되는 순간 그대로 이어진다.
  {
    path: 'goals/recommendations/:type',
    name: 'goal-recommendation-detail',
    component: RecommendationDetailView,
    props: true,
  },
  { path: 'goals', name: 'goal-empty', component: GoalEmptyView },
  // 목표 수정도 생성과 완전히 같은 흐름을 탄다: 단계별 조건 입력 → 추천 목록 → 추천 상세 →
  // 저장. 그래서 화면도 생성과 같은 GoalConditionStepsView이고, goalId만 더 받는다.
  //
  // goalId를 쿼리가 아니라 경로로 둬야 goalId가 빠진 주소가 아예 성립하지 않아, 수정하려던
  // 요청이 조용히 생성으로 새어나가지 않는다.
  { path: 'goals/:goalId/edit', name: 'goal-edit', component: GoalConditionStepsView, props: true },
  { path: 'goals/:goalId', name: 'goal-detail', component: GoalDetailView, props: true },
]
