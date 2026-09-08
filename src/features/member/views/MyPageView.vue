<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppHeader from '@/shared/components/molecules/AppHeader.vue'
import BaseCard from '@/shared/components/atoms/base/card/BaseCard.vue'
import BaseToggle from '@/shared/components/atoms/form/Toggle/BaseToggle.vue'
import BaseModal from '@/shared/components/atoms/feedback/Modal/BaseModal.vue'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'
import BaseBadge from '@/shared/components/atoms/base/badge/BaseBadge.vue'
import BaseChevronIcon from '@/shared/components/atoms/base/icon/BaseChevronIcon.vue'

import { useAvatar } from '@/shared/composables/useAvatar'

import { useMemberStore, AGREEMENT_TYPE } from '@/features/member/store/memberStore'
// 도메인 간 참조는 index.js를 통해서만 한다(docs/architecture.md의 Dependency Rules).
import { useGoalStore } from '@/features/goal'
import { useTheme } from '@/shared/composables/useTheme'

const router = useRouter()
const route = useRoute()
const memberStore = useMemberStore()
const goalStore = useGoalStore()
// 회원정보 수정에서 고른 캐릭터를 그대로 보여준다
const { avatarSrc, avatarCrop } = useAvatar()
const { theme, toggleTheme } = useTheme()

const isLogoutModalOpen = ref(false)
const compareDataSectionRef = ref(null)
const isCompareDataShaking = ref(false)

const isDarkTheme = computed({
  get: () => theme.value === 'dark',
  set: () => toggleTheme(),
})

const notificationAgreed = computed({
  get: () => memberStore.profile?.notificationAgreed ?? false,
  set: (value) => memberStore.toggleAgreement(AGREEMENT_TYPE.NOTIFICATION, value),
})

const compareDataAgreed = computed({
  get: () => memberStore.profile?.compareDataAgreed ?? false,
  set: (value) => memberStore.toggleAgreement(AGREEMENT_TYPE.COMPARE_DATA, value),
})

/**
 * 등반 레벨·칭호.
 *
 * 서버가 아직 레벨을 내려주지 않고, 산정 기준도 팀에서 정하지 않았다. 기준이 정해지고
 * API에 필드가 생기면 memberStore.profile 에서 읽어오도록 바꾸면 된다.
 * (아래 고도(altitudePercent)와 달리 이 둘은 아직 임시값이다.)
 */
const climbLevel = 3
const climbTitle = '등반가'

const EXP_SEGMENT_COUNT = 10

/**
 * 등반 고도 = 목표 달성률.
 *
 * 홈의 등반 카드와 같은 GET /goals/summary 응답(progress.achievementRate)을 본다.
 * 예전에는 27로 고정돼 있어 홈과 다른 숫자가 나왔다. 활성 목표가 없으면 0%다.
 */
const altitudePercent = computed(() => {
  const rate = goalStore.goalSummary?.progress?.achievementRate
  if (typeof rate !== 'number') return 0
  return Math.min(100, Math.max(0, Math.round(rate)))
})

/** 진행률을 칸 수로 바꾼다. 홈의 등반 카드와 같은 방식이다. */
const filledSegments = computed(() => Math.round((altitudePercent.value / 100) * EXP_SEGMENT_COUNT))

onMounted(async () => {
  if (!memberStore.profile) memberStore.fetchProfile()
  // 홈을 거치지 않고 마이페이지로 바로 들어와도 고도가 채워지도록 여기서도 불러온다.
  if (!goalStore.goalSummary) goalStore.loadGoalSummary()

  // 비교 화면 잠금 카드에서 "약관 동의하러 가기"로 들어왔을 때, 해당 항목이
  // 화면 세로 가운데에 오도록 스크롤해준다.
  // 쿼리 정리를 router.replace로 하면 vue-router의 전역 scrollBehavior({top:0})가
  // 뒤늦게(비동기로) 실행되면서 아래 scrollIntoView를 덮어써 스크롤이 안 먹는 것처럼
  // 보인다. 그래서 라우터 네비게이션을 타지 않는 history API로 쿼리만 지운다.
  if (route.query.scrollTo === 'compare-data-agreed') {
    window.history.replaceState(history.state, '', router.resolve({ name: 'my' }).fullPath)
    await nextTick()
    // 페이지 진입 직후(같은 마이크로태스크) 바로 호출하면 브라우저의 초기 스크롤
    // 처리와 겹쳐서 scrollIntoView가 씹힌다. setTimeout으로 매크로태스크로 미뤄야 먹힌다.
    setTimeout(() => {
      compareDataSectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // 스크롤이 어느 정도 끝난 뒤에 흔들어야 "이 카드예요"가 눈에 들어온다.
      // 스크롤 도중에 같이 흔들면 위치가 계속 바뀌어서 흔들림이 잘 안 보인다.
      setTimeout(() => {
        isCompareDataShaking.value = true
      }, 500)
    })
  }
})

function goToEditInfo() {
  router.push({ name: 'edit-info' })
}

function goToAssetLink() {
  router.push({ name: 'asset-link-additional' })
}

function openLogoutModal() {
  isLogoutModalOpen.value = true
}

function confirmLogout() {
  isLogoutModalOpen.value = false
  router.push({ name: 'logout' })
}
</script>

<template>
  <div class="my-page-view my-page-view--animated">
    <AppHeader title="마이페이지" :show-back="false" />

    <section class="my-page-view__profile">
      <div class="my-page-view__avatar">
        <img class="my-page-view__avatar-img" :src="avatarSrc" :style="avatarCrop" alt="" />
      </div>
      <p class="my-page-view__nickname">{{ memberStore.profile?.nickname ?? '회원' }} 님</p>

      <div class="my-page-view__badges">
        <BaseBadge class="my-page-view__badge--level" variant="mint">
          Lv.{{ climbLevel }} {{ climbTitle }}
        </BaseBadge>
      </div>

      <div class="my-page-view__exp">
        <span class="my-page-view__exp-track">
          <span
            v-for="index in EXP_SEGMENT_COUNT"
            :key="index"
            class="my-page-view__exp-segment"
            :class="{
              'my-page-view__exp-segment--filled': index <= filledSegments,
              'my-page-view__exp-segment--current': index === filledSegments,
            }"
          />
        </span>
        <span class="my-page-view__exp-value">{{ altitudePercent }}%</span>
      </div>
    </section>

    <section class="my-page-view__section">
      <h2 class="my-page-view__section-title">계정 관리</h2>
      <BaseCard class="my-page-view__card">
        <button type="button" class="my-page-view__row" @click="goToEditInfo">
          <span class="my-page-view__row-label">회원정보 수정</span>
          <BaseChevronIcon class="my-page-view__chevron" />
        </button>
        <button type="button" class="my-page-view__row" @click="goToAssetLink">
          <span class="my-page-view__row-label">자산 연동 관리</span>
          <BaseChevronIcon class="my-page-view__chevron" />
        </button>
      </BaseCard>
    </section>

    <section class="my-page-view__section">
      <h2 class="my-page-view__section-title">알림 설정</h2>
      <BaseCard class="my-page-view__card">
        <div class="my-page-view__row my-page-view__row--toggle">
          <div class="my-page-view__row-text">
            <span class="my-page-view__row-label">알림 받기</span>
            <span class="my-page-view__row-desc"
              >저축 현황, 매물 시세 변동 등 주요 소식을 알려드려요</span
            >
          </div>
          <BaseToggle v-model="notificationAgreed" />
        </div>
      </BaseCard>
    </section>

    <section ref="compareDataSectionRef" class="my-page-view__section">
      <h2 class="my-page-view__section-title">데이터 설정</h2>
      <BaseCard class="my-page-view__card">
        <div
          class="my-page-view__row my-page-view__row--toggle"
          :class="{ 'my-page-view__row--shake': isCompareDataShaking }"
          @animationend="isCompareDataShaking = false"
        >
          <div class="my-page-view__row-text">
            <span class="my-page-view__row-label">[선택] 또래 비교 데이터 제공</span>
            <span class="my-page-view__row-desc"
              >익명 처리된 데이터가 또래 비교 통계에 활용돼요</span
            >
          </div>
          <BaseToggle v-model="compareDataAgreed" />
        </div>
      </BaseCard>
    </section>

    <section class="my-page-view__section">
      <h2 class="my-page-view__section-title">테마 설정</h2>
      <BaseCard class="my-page-view__card">
        <div class="my-page-view__row my-page-view__row--toggle">
          <div class="my-page-view__row-text">
            <span class="my-page-view__row-label">다크 모드</span>
          </div>
          <BaseToggle v-model="isDarkTheme" />
        </div>
      </BaseCard>
    </section>

    <section class="my-page-view__section">
      <h2 class="my-page-view__section-title">앱 정보</h2>
      <BaseCard class="my-page-view__card">
        <router-link :to="{ name: 'terms' }" class="my-page-view__row">
          <span class="my-page-view__row-label">이용약관</span>
          <BaseChevronIcon class="my-page-view__chevron" />
        </router-link>
        <router-link :to="{ name: 'privacy' }" class="my-page-view__row">
          <span class="my-page-view__row-label">개인정보 처리방침</span>
          <BaseChevronIcon class="my-page-view__chevron" />
        </router-link>
        <div class="my-page-view__row my-page-view__row--static">
          <span class="my-page-view__row-label">앱 버전</span>
          <span class="my-page-view__row-value">1.0.0</span>
        </div>
      </BaseCard>
    </section>

    <button type="button" class="my-page-view__logout-link" @click="openLogoutModal">
      로그아웃
    </button>

    <BaseModal v-model="isLogoutModalOpen" title="로그아웃 하시겠어요?">
      <p class="my-page-view__logout-desc">로그아웃하면 다시 로그인해야 앱을 이용할 수 있어요</p>
      <template #footer>
        <BaseButton variant="secondary" @click="isLogoutModalOpen = false"> 취소 </BaseButton>
        <BaseButton variant="primary" @click="confirmLogout">로그아웃</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.my-page-view {
  display: flex;
  flex-direction: column;
  font-weight: 600;
}

/*
  홈/비교/목표 상세 화면과 같은 card-rise 진입 모션(main.css에 공용 정의)을 재사용해서
  프로필/설정 섹션들이 순서대로 살짝 떠오르며 나타나게 한다.
*/
.my-page-view--animated > * {
  animation: card-rise 0.35s ease-out both;
}

.my-page-view--animated > *:nth-child(2) {
  animation-delay: 0.04s;
}

.my-page-view--animated > *:nth-child(3) {
  animation-delay: 0.08s;
}

.my-page-view--animated > *:nth-child(4) {
  animation-delay: 0.12s;
}

.my-page-view--animated > *:nth-child(5) {
  animation-delay: 0.16s;
}

.my-page-view--animated > *:nth-child(6) {
  animation-delay: 0.2s;
}

.my-page-view--animated > *:nth-child(7) {
  animation-delay: 0.24s;
}

.my-page-view--animated > *:nth-child(8) {
  animation-delay: 0.28s;
}

.my-page-view__profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0 12px;
}

.my-page-view__avatar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76px;
  height: 76px;
  border-radius: 38px;
  /* 아래 avatar-img를 원보다 크게 키워 잘라내므로, 원 밖으로 넘치는 부분을 잘라낸다 */
  overflow: hidden;
  /* BaseCard와 같은 배경·그림자 */
  background: var(--color-surface, #161616);
  box-shadow: 0 2px 6px rgba(90, 143, 77, 0.06);
}

/*
  climber.png는 1086x1448 전신 그림이다. 76px 원 안에 전신을 다 넣으면 얼굴이 몇 px밖에
  안 되어 누구인지 알아볼 수 없다. 프로필 사진이니 사람 얼굴처럼 상반신만 보이도록
  원본을 확대해 잘라 쓴다.

  보여줄 구간은 원본 좌표로 x 103~983, y -40~840 (880x880 정사각)이고,
  아래 값은 전부 그 구간에서 나온 계산 결과다.
    배율   = 76 / 880
    width  = 1086 x 배율 / 76 = 123.4%
    left   = -103 x 배율 / 76 = -11.7%
    top    = 40   x 배율 / 76 = 4.6%
  y가 음수인 것은 그림 위쪽 바깥까지 구간에 넣었다는 뜻이다. 모자 위에 여백이 생겨
  얼굴이 원 중앙에 가깝게 놓인다. 그 여백은 원의 배경색이 그대로 보인다.

  구간을 넓히면 캐릭터가 작아지고(width 감소) 좁히면 커진다. top을 키우면 캐릭터가
  아래로, 줄이면 위로 움직인다. 그림을 바꾸면 이 세 값을 다시 계산해야 한다.
*/
/* 위치·크기(top/left/width)는 캐릭터마다 달라 useAvatar의 crop 값을 :style로 받는다 */
.my-page-view__avatar-img {
  position: absolute;
  height: auto;
}

.my-page-view__nickname {
  margin: 12px 0 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.my-page-view__badges {
  display: flex;
  gap: 6px;
  margin-top: 10px;
}

/* 홈 화면(GreetingHeader)의 레벨 뱃지와 같은 스타일로 맞춘다. */
.my-page-view :deep(.my-page-view__badge--level) {
  font-weight: 700;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.my-page-view__exp {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  max-width: 280px;
  margin-top: 10px;
}

/* 칸 사이를 띄워 눈금처럼 보이게 한다. 홈 등반 카드와 같은 방식이다. */
.my-page-view__exp-track {
  display: flex;
  flex: 1;
  gap: 4px;
}

.my-page-view__exp-segment {
  flex: 1;
  height: 11px;
  border-radius: 3px;
  background: var(--color-progress-inactive, #b6d4bd);
}

/* 목표 화면(GoalProgressCard) 진행 바와 같은 색을 쓴다. */
.my-page-view__exp-segment--filled {
  background: var(--color-progress-active, #1d6b3f);
}

/* 지금 서 있는 칸만 강조색. --filled 뒤에 와야 덮어쓴다. */
.my-page-view__exp-segment--current {
  background: var(--color-accent, #ffd939);
}

.my-page-view__exp-value {
  font-size: 10px;
  color: var(--color-text-secondary, #9aa09a);
  font-variant-numeric: tabular-nums;
}

.my-page-view__section {
  padding-top: 12px;
}

.my-page-view__section-title {
  margin: 0 0 8px;
  padding: 0 4px;
  font-size: 14.5px;
  font-weight: 600;
  color: var(--color-text-secondary, #c1e8c8);
}

/* 계정 관리/알림 설정/앱 정보 등 행을 묶는 흰 카드. BaseCard가 이미 배경/모서리/그림자를 준다. */
.my-page-view__card {
  display: flex;
  flex-direction: column;
  padding: 2px 16px;
}

.my-page-view__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 0;
  border: none;
  background: none;
  color: inherit;
  text-decoration: none;
  cursor: pointer;
}

/* 카드 안에서 행끼리만 구분선을 두고, 첫 행 위에는 선을 두지 않는다. */
.my-page-view__row + .my-page-view__row {
  border-top: 1px solid var(--color-border, #262626);
}

.my-page-view__row--static {
  cursor: default;
}

.my-page-view__row-label {
  font-size: 13.9px;
  color: var(--color-text-primary, #ffffff);
}

.my-page-view__row-value {
  font-size: 13.2px;
  color: var(--color-text-secondary, #9aa09a);
}

.my-page-view__chevron {
  color: var(--color-text-secondary, #9aa09a);
}

.my-page-view__row--toggle {
  align-items: center;
}

/*
  비교 화면 잠금 카드에서 이 항목을 보러 왔을 때, 스크롤이 끝난 뒤 살짝 흔들어서
  "이 항목이에요"를 짚어준다.
*/
.my-page-view__row--shake {
  animation: row-shake 0.5s ease-in-out;
}

@keyframes row-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-6px);
  }
  40% {
    transform: translateX(5px);
  }
  60% {
    transform: translateX(-3px);
  }
  80% {
    transform: translateX(2px);
  }
}

.my-page-view__row-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.my-page-view__row-desc {
  font-size: 11.1px;
  color: var(--color-text-secondary, #9aa09a);
}

.my-page-view__logout-desc {
  margin: 0;
  color: #4a5a52;
  font-size: 13px;
  text-align: center;
}

.my-page-view__logout-link {
  margin: 20px auto 0;
  padding: 0;
  border: none;
  background: none;
  color: var(--color-text-secondary, #9aa09a);
  font-size: 12px;
  text-decoration: underline;
  cursor: pointer;
}
</style>
