import { ref } from 'vue'
import { defineStore } from 'pinia'

import { HOUSING_TYPE_LABEL, DEAL_TYPE_LABEL } from '@/shared/constants/housing'

import { fetchGoalSummary, fetchGoalMarketTrend } from '@/features/goal/api/goalApi'
import { getAssetSummary } from '@/features/asset/api/assetApi'
import {
  toMarketAlertViewModel,
  toHomeMarketInsightLabel,
} from '@/features/goal/utils/marketAlertViewModel'

// 레벨/알림 배지는 홈 화면 API 명세(목표 요약 · 자산 요약) 어디에도 없는 항목이라
// 연동할 API가 아직 없다. 화면 골격을 채우기 위한 임시 표시값.
const PLACEHOLDER_MEMBER_BADGE = {
  nickname: '민지',
  level: 3,
  levelTitle: '등반가',
  hasUnreadNotification: true,
}

// GET /goals/summary 응답 -> ClimbProgressCard/ActiveGoalCard가 쓰는 goal 뷰모델
function toGoalViewModel(goalSummary) {
  return {
    id: goalSummary.goalId,
    housingType:
      HOUSING_TYPE_LABEL[goalSummary.housing.housingType] ?? goalSummary.housing.housingType,
    dealType: DEAL_TYPE_LABEL[goalSummary.housing.dealType] ?? goalSummary.housing.dealType,
    regionName: goalSummary.housing.regionName,
    targetAmount: goalSummary.targetAmount,
    targetDate: goalSummary.targetDate,
  }
}

// GET /goals/summary 응답 -> ClimbProgressCard/ActiveGoalCard가 쓰는 climb(달성률) 뷰모델
function toClimbViewModel(goalSummary) {
  return {
    progressPercent: Math.round(goalSummary.progress.achievementRate),
    currentAmount: goalSummary.progress.currentAmount,
    remainingAmount: goalSummary.progress.remainingAmount,
    // 최근 자산 증가액은 이번 API 명세에 없는 지표라 임시로 0 처리
    recentIncreaseAmount: 0,
  }
}

// GET /assets/summary 응답 -> TotalAssetCard의 예적금/대출 row가 쓰는 assetBreakdown 뷰모델
// (loans는 assetBreakdown이 아니라 응답 최상단에 있어 별도로 옮겨준다)
function toAssetBreakdownViewModel(assetSummary) {
  return {
    depositSavings: {
      totalAmount: assetSummary.assetBreakdown.cashAssets.total,
      accountCount: assetSummary.assetBreakdown.cashAssets.accounts.length,
    },
    loan: {
      accountCount: assetSummary.loans.length,
    },
  }
}

export const useHomeStore = defineStore('home', () => {
  const member = ref(PLACEHOLDER_MEMBER_BADGE)
  const goal = ref(null)
  const climb = ref(null)
  const assetSummary = ref(null)
  const assetBreakdown = ref(null)
  // 현재 목표 카드의 "최근 OO 시세 상승/하락으로 예상 시점 +N개월" 한 줄. 목표 상세 화면의
  // 매물 시세 변화 카드와 같은 API(GET /goals/market-trend)를 홈에서도 그대로 재사용한다.
  const marketInsight = ref(null)
  const isLoading = ref(false)
  const loaded = ref(false)

  async function loadSummary() {
    isLoading.value = true

    // 세 API는 서로 독립적이라, 하나가 실패(예: 활성 목표 없음, 자산 미연동, 시세 데이터 없음)
    // 해도 나머지 카드는 그대로 보여준다.
    const [goalSummaryResult, assetSummaryResult, marketTrendResult] = await Promise.allSettled([
      fetchGoalSummary(),
      getAssetSummary(),
      fetchGoalMarketTrend(),
    ])

    if (goalSummaryResult.status === 'fulfilled') {
      goal.value = toGoalViewModel(goalSummaryResult.value)
      climb.value = toClimbViewModel(goalSummaryResult.value)
    } else {
      goal.value = null
      climb.value = null
    }

    if (assetSummaryResult.status === 'fulfilled') {
      const raw = assetSummaryResult.value
      assetSummary.value = raw
      assetBreakdown.value = toAssetBreakdownViewModel(raw)
    } else {
      // 자산 미연동(ASSET_006) 등으로 실패하면 자산 카드 자리에 연동 유도 카드를 대신 보여준다.
      assetSummary.value = null
      assetBreakdown.value = null
    }

    marketInsight.value =
      marketTrendResult.status === 'fulfilled'
        ? toHomeMarketInsightLabel(toMarketAlertViewModel(marketTrendResult.value))
        : null

    isLoading.value = false
    loaded.value = true
  }

  return {
    member,
    goal,
    climb,
    assetSummary,
    assetBreakdown,
    marketInsight,
    isLoading,
    loaded,
    loadSummary,
  }
})
