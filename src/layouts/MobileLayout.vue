<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import MobileContainer from '@/shared/components/molecules/MobileContainer.vue'
import BaseBottomNav from '@/shared/components/atoms/navigation/BottomNav/BaseBottomNav.vue'
import {
  HomeIcon,
  PolicyIcon,
  PolicyIcon as CompareIcon,
  ConsultIcon,
  MyIcon,
} from '@/shared/components/atoms/navigation/BottomNav/icons'

const route = useRoute()
const router = useRouter()

const navItems = [
  { label: '홈', icon: HomeIcon, to: '/home' },
  { label: '정책', icon: PolicyIcon, to: '/policy' },
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
  // 상담사 홈은 사용자용 GNB(홈/정책/비교/상담/마이)와 무관한 별도 진입점이라, 같은
  // 정책으로 하단 탭을 숨긴다. 상담사 전용 GNB를 새로 만들지는 않는다.
  'counselor-home',
]

const activeIndex = computed(() =>
  navItems.findIndex((item) => route.path.startsWith(item.to)),
)
const showNav = computed(() => route.path !== '/' && !HIDDEN_NAV_ROUTE_NAMES.includes(route.name))

function handleTabChange(index) {
  const item = navItems[index]
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
  width: calc(100% - 16px);
  max-width: 384px;
  transform: translateX(-50%);
}
</style>
