<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import MobileContainer from '@/shared/components/molecules/MobileContainer.vue'
import BaseBottomNav from '@/shared/components/atoms/navigation/BottomNav/BaseBottomNav.vue'
import {
  HomeIcon,
  GoalIcon,
  PolicyIcon as CompareIcon,
  ConsultIcon,
  MyIcon,
} from '@/shared/components/atoms/navigation/BottomNav/icons'
import { fetchActiveGoal } from '@/features/goal/api/goalApi'

const route = useRoute()
const router = useRouter()

// 목표 탭은 goalId가 있어야 이동 가능한 동적 경로라 고정 path(to) 대신,
// 활성 목표 존재 여부에 따라 이동할 라우트 이름(matchNames)으로 활성 탭을 판정한다.
const navItems = [
  { label: '홈', icon: HomeIcon, to: '/home' },
  { label: '목표', icon: GoalIcon, matchNames: ['goal-detail', 'goal-empty'] },
  { label: '비교', icon: CompareIcon, to: '/compare' },
  { label: '상담', icon: ConsultIcon, to: '/consult' },
  { label: '마이', icon: MyIcon, to: '/my' },
]

const HIDDEN_NAV_ROUTE_NAMES = [
  'diagnosis',
  // 목표 수정도 진단과 같은 한 흐름(조건 입력 → 진단 결과 → 저장)이라, 중간에 탭으로
  // 빠져나갈 수 있으면 입력하던 내용이 그대로 사라진다. 생성 쪽과 같이 탭을 숨긴다.
  'goal-edit',
  'goal-recommendations',
  'goal-recommendation-detail',
  'edit-info',
  'asset-link-additional',
  'asset-detail',
  // 예약 흐름(일정 선택 → 상담 정보 → 예약 완료)과 내 상담, 그리고 내 상담에서
  // 이어지는 채팅/리포트는 상담 탭에서 벗어난 하위 화면이라, 다른 상세 화면들과
  // 같이 하단 탭을 숨긴다.
  'consult-reservation',
  'consult-reservation-info',
  'consult-my',
  'consult-reservation-complete',
  'consult-chat',
  'consult-report',
  // 상담사 홈은 사용자용 GNB(홈/자산/목표/상담/MY)와 무관한 별도 진입점이라, 같은
  // 정책으로 하단 탭을 숨긴다. 상담사 전용 GNB를 새로 만들지는 않는다.
  'counselor-home',
]

const activeIndex = computed(() =>
  navItems.findIndex((item) =>
    item.matchNames ? item.matchNames.includes(route.name) : route.path.startsWith(item.to),
  ),
)
const showNav = computed(() => route.path !== '/' && !HIDDEN_NAV_ROUTE_NAMES.includes(route.name))

// 활성 목표가 있으면 목표 상세로, 없으면 목표 설정을 안내하는 화면으로 보낸다.
// 활성 목표 없음은 API 명세상 오류가 아니라 data:null인 정상 응답이라, 인증 만료 등
// 진짜 실패했을 때만 방어적으로 빈 화면을 보여준다.
async function goToGoalTab() {
  try {
    const activeGoal = await fetchActiveGoal()
    if (activeGoal) {
      router.push({ name: 'goal-detail', params: { goalId: activeGoal.goalId } })
    } else {
      router.push({ name: 'goal-empty' })
    }
  } catch {
    router.push({ name: 'goal-empty' })
  }
}

function handleTabChange(index) {
  const item = navItems[index]
  if (item.matchNames) {
    goToGoalTab()
    return
  }
  if (item.to !== route.path) router.push(item.to)
}
</script>

<template>
  <MobileContainer full-height>
    <main class="mobile-layout__content" :class="{ 'mobile-layout__content--no-nav': !showNav }">
      <RouterView />
    </main>
    <nav v-if="showNav" class="mobile-layout__nav">
      <BaseBottomNav
        :items="navItems"
        :model-value="activeIndex"
        @update:model-value="handleTabChange"
      />
    </nav>
  </MobileContainer>
</template>

<style scoped>
.mobile-layout__content {
  box-sizing: border-box;
  min-height: 100vh;
  padding: 16px 16px 96px;
}

.mobile-layout__content--no-nav {
  padding-bottom: 16px;
}

.mobile-layout__nav {
  position: fixed;
  z-index: 10;
  bottom: 12px;
  left: 50%;
  /* 콘텐츠 카드(좌우 16px 패딩)보다 좌우 각 8px씩 더 넓혀, 카드와 같은 폭으로 보이지
     않고 화면을 조작하는 별도 레이어처럼 보이게 한다. 화면 끝까지는 붙지 않도록
     8px의 최소 side margin은 남긴다. */
  width: calc(100% - 16px);
  max-width: 384px;
  transform: translateX(-50%);
}
</style>
