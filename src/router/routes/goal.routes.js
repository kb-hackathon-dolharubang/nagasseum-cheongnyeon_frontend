import {
  GoalConditionStepsView,
  RecommendationDetailView,
  GoalDetailView,
  GoalEmptyView,
} from '@/features/goal'

export const goalRoutes = [
  { path: 'diagnosis', name: 'diagnosis', component: GoalConditionStepsView },
  {
    path: 'goals/recommendations',
    name: 'goal-recommendations',
    component: RecommendationDetailView,
  },
  { path: 'goals', name: 'goal-empty', component: GoalEmptyView },
  { path: 'goals/:goalId/edit', name: 'goal-edit', component: GoalConditionStepsView, props: true },
  { path: 'goals/:goalId', name: 'goal-detail', component: GoalDetailView, props: true },
]
