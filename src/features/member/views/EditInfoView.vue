<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import AppHeader from '@/shared/components/molecules/AppHeader.vue'
import BaseButton from '@/shared/components/atoms/base/button/BaseButton.vue'
import BaseFieldBadge from '@/shared/components/atoms/base/badge/BaseFieldBadge.vue'
import BaseInputField from '@/shared/components/molecules/BaseInputField.vue'
import BaseOptionCardGroup from '@/shared/components/atoms/form/OptionCardGroup/BaseOptionCardGroup.vue'
import BaseModal from '@/shared/components/atoms/feedback/Modal/BaseModal.vue'
import { useAvatar, AVATAR_OPTIONS } from '@/shared/composables/useAvatar'
import { INCOME_BRACKET_OPTIONS } from '@/shared/constants/incomeBracket'
import { OCCUPATION_OPTIONS } from '@/shared/constants/occupation'

import { useMemberStore } from '@/features/member/store/memberStore'

const router = useRouter()
const memberStore = useMemberStore()
const { avatarId, avatarSrc, avatarCrop, setAvatar } = useAvatar()

/*
  캐릭터 선택 팝업. 고른 즉시 반영하지 않고 pendingAvatarId에 담아뒀다가 '변경'을 눌러야
  확정한다 — 여러 개를 눌러보며 비교하는 동안 뒤 화면이 계속 바뀌면 산만하고, 취소로
  되돌릴 방법도 없어진다.
*/
const isAvatarPickerOpen = ref(false)
const pendingAvatarId = ref(null)

const nickname = ref('')
const incomeBracket = ref(null)
/** 화면에서는 만원 단위로 받는다. 서버는 원 단위라 저장할 때 10,000을 곱한다. */
const monthlyIncomeManwon = ref('')
const occupationType = ref(null)

onMounted(async () => {
  if (!memberStore.profile) await memberStore.fetchProfile()
  nickname.value = memberStore.profile?.nickname ?? ''
  incomeBracket.value = memberStore.profile?.incomeBracket ?? null
  monthlyIncomeManwon.value =
    memberStore.profile?.monthlyIncome != null
      ? String(Math.round(memberStore.profile.monthlyIncome / 10000))
      : ''
  occupationType.value = memberStore.profile?.occupationType ?? null
})

// 숫자만 남긴다. 서버가 Long으로 받기 때문에 글자가 섞이면 저장에서 막힌다.
watch(monthlyIncomeManwon, (value) => {
  const digits = value.replace(/\D/g, '')
  if (digits !== value) monthlyIncomeManwon.value = digits
})

/**
 * 서버에 보낼 월 소득(원).
 *
 * <p>비워두면 null이고, updateProfile은 null인 항목을 요청에서 빼기 때문에 기존 값이
 * 그대로 남는다. 지우는 기능은 지금 API로는 안 된다.
 */
const monthlyIncome = computed(() =>
  monthlyIncomeManwon.value ? Number(monthlyIncomeManwon.value) * 10000 : null,
)

function openAvatarPicker() {
  pendingAvatarId.value = avatarId.value
  isAvatarPickerOpen.value = true
}

function confirmAvatar() {
  setAvatar(pendingAvatarId.value)
  isAvatarPickerOpen.value = false
}

// 이미 고른 것을 다시 누르면 해제한다. 필수값이 아니라서 되돌릴 방법이 있어야 한다.
function selectOccupation(value) {
  occupationType.value = occupationType.value === value ? null : value
}

async function handleSave() {
  await memberStore.updateProfile({
    nickname: nickname.value,
    incomeBracket: incomeBracket.value,
    monthlyIncome: monthlyIncome.value,
    occupationType: occupationType.value,
  })
  if (memberStore.error) return

  router.back()
}
</script>

<template>
  <div class="edit-info-view edit-info-view--animated">
    <AppHeader title="회원정보 수정" @back="router.back()" />

    <section class="edit-info-view__avatar-section">
      <!-- 동그라미와 아래 문구가 한 덩어리로 눌린다. 문구만 보고 누르는 사람도 있어서다. -->
      <button type="button" class="edit-info-view__avatar-button" @click="openAvatarPicker">
        <span class="edit-info-view__avatar">
          <!--
            마이페이지 프로필과 같은 그림·같은 크롭을 쓴다. 잘라내는 원을 따로 두는 이유는,
            바깥 .edit-info-view__avatar에 overflow: hidden을 걸면 아래 연필 배지까지
            잘려나가기 때문이다.
          -->
          <span class="edit-info-view__avatar-clip">
            <img class="edit-info-view__avatar-img" :src="avatarSrc" :style="avatarCrop" alt="" />
          </span>
          <span class="edit-info-view__avatar-edit">
            <svg viewBox="0 0 16 16" width="9" height="9">
              <path
                d="M11 1L15 5L5 15H1V11L11 1Z"
                fill="none"
                stroke="currentColor"
                stroke-width="1.4"
                stroke-linejoin="round"
              />
            </svg>
          </span>
        </span>
        <span class="edit-info-view__avatar-label">프로필 사진 변경</span>
      </button>
    </section>

    <BaseModal
      v-model="isAvatarPickerOpen"
      title="캐릭터 선택"
      class="edit-info-view__avatar-modal"
    >
      <ul class="avatar-picker">
        <li v-for="option in AVATAR_OPTIONS" :key="option.id">
          <button
            type="button"
            class="avatar-picker__item"
            :class="{ 'avatar-picker__item--selected': option.id === pendingAvatarId }"
            :aria-pressed="option.id === pendingAvatarId"
            :aria-label="option.label"
            @click="pendingAvatarId = option.id"
          >
            <span class="avatar-picker__thumb">
              <img class="avatar-picker__img" :src="option.src" :style="option.crop" alt="" />
            </span>
          </button>
        </li>
      </ul>

      <template #footer>
        <BaseButton variant="secondary" @click="isAvatarPickerOpen = false"> 취소 </BaseButton>
        <BaseButton variant="primary" @click="confirmAvatar">변경</BaseButton>
      </template>
    </BaseModal>

    <section class="edit-info-view__section">
      <h2 class="edit-info-view__section-title">기본 정보</h2>

      <BaseInputField
        v-model="nickname"
        label="닉네임"
        required
        :max-length="12"
        placeholder="2~12자 한글 · 영문 · 숫자"
        helper-text="서비스에서 표시되는 이름입니다"
      />

      <div class="edit-info-view__field">
        <div class="edit-info-view__field-label-row">
          <span class="edit-info-view__field-label">소득 분위</span>
          <BaseFieldBadge :required="false" />
        </div>
        <BaseOptionCardGroup v-model="incomeBracket" :options="INCOME_BRACKET_OPTIONS" />
      </div>

      <BaseInputField
        v-model="monthlyIncomeManwon"
        label="월 소득"
        :max-length="5"
        :show-counter="false"
        placeholder="만원 단위로 입력"
        helper-text="또래 비교에서 내 소득 구간을 표시하는 데 쓰입니다"
      >
        <template #suffix>만원</template>
      </BaseInputField>

      <div class="edit-info-view__field">
        <div class="edit-info-view__field-label-row">
          <span class="edit-info-view__field-label">직업군</span>
          <BaseFieldBadge :required="false" />
        </div>
        <div class="edit-info-view__chips">
          <button
            v-for="option in OCCUPATION_OPTIONS"
            :key="option.value"
            type="button"
            class="edit-info-view__chip"
            :class="{ 'edit-info-view__chip--selected': occupationType === option.value }"
            :aria-pressed="occupationType === option.value"
            @click="selectOccupation(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
        <p class="edit-info-view__field-helper">
          또래 비교에서 같은 직업군끼리 묶어보는 데 쓰입니다
        </p>
      </div>
    </section>

    <div class="edit-info-view__footer">
      <BaseButton size="lg" @click="handleSave">저장하기</BaseButton>
    </div>
  </div>
</template>

<style scoped>
.edit-info-view {
  /*
    BaseInputField와 BaseOptionCardGroup이 아직 legacy --text-h(#ffffff 고정)를 쓴다.
    라이트에서 "닉네임" "월 소득" 라벨과 안 고른 분위 카드 글씨가 흰 배경에 묻힌다.
    공용 컴포넌트를 고치지 않고 이 화면에서만 변수를 테마 토큰으로 바꿔 끼운다.
  */
  --text-h: var(--color-text-primary);
  /*
    legacy --border도 #262626 고정이라 라이트에서 입력창·분위 카드만 검은 테두리가 된다.
    다른 카드와 같은 연한 선으로 맞춘다.
  */
  --border: var(--color-border);
  /*
    "필수" "선택" 뱃지도 색이 박혀 있다(#3a1f1f / #1e211f). 라이트에서 검은 알약이 된다.
    기본값은 다크로 두고 라이트만 덮어쓴다.
  */
  --badge-required-bg: #3a1f1f;
  --badge-required-ink: #ff6b6b;
  --badge-optional-bg: #1e211f;

  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 24px;
}

.edit-info-view--animated > * {
  animation: card-rise 0.35s ease-out both;
}

.edit-info-view--animated > *:nth-child(2) {
  animation-delay: 0.04s;
}

.edit-info-view--animated > *:nth-child(3) {
  animation-delay: 0.08s;
}

.edit-info-view--animated > *:nth-child(4) {
  animation-delay: 0.12s;
}

:root[data-theme='light'] .edit-info-view {
  --badge-required-bg: #fdeeea;
  --badge-required-ink: #c1442e;
  --badge-optional-bg: #eff1eb;
}

.edit-info-view :deep(.base-field-badge) {
  background: var(--badge-required-bg);
  color: var(--badge-required-ink);
}

.edit-info-view :deep(.base-field-badge--optional) {
  background: var(--badge-optional-bg);
  color: var(--color-text-secondary);
}

.edit-info-view__avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.edit-info-view__avatar-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  cursor: pointer;
}

.edit-info-view__avatar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 84px;
  height: 84px;
  border-radius: 42px;
  /* 마이페이지 프로필과 같은 배경. 라이트에서는 흰색, 다크에서는 어두운 카드색이 된다
     (다크에서 흰 원은 화면에서 혼자 튄다). color는 사람 실루엣 아이콘을 쓰던 시절의
     잔재라 함께 제거했다 — 지금 원 안의 그림은 이미지고, 연필 배지는 색을 따로 정한다. */
  background: var(--color-surface, #161616);
}

.edit-info-view__avatar-clip {
  position: relative;
  width: 100%;
  height: 100%;
  /* 부모와 같은 원형으로 잘라낸다 */
  border-radius: inherit;
  overflow: hidden;
}

/*
  전신 그림에서 모자 위~가슴 구간만 확대해 보여준다. 세 값은 MyPageView와 같은 계산
  결과이며, 컨테이너 크기에 대한 비율이라 원 지름이 달라도(84px) 그대로 쓸 수 있다.
  계산식은 MyPageView.vue의 같은 자리 주석을 참고할 것.
*/
/* 위치·크기(top/left/width)는 캐릭터마다 달라 useAvatar의 crop 값을 :style로 받는다 */
.edit-info-view__avatar-img {
  position: absolute;
  height: auto;
}

.edit-info-view__avatar-edit {
  position: absolute;
  right: -2px;
  bottom: -2px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 14px;
  background: var(--bg, #111111);
  /* 아바타와 겹치는 자리라 페이지 색으로 테두리를 둘러 경계를 만든다. */
  border: 2px solid var(--color-app-bg);
  /* 이 동그라미 배경(--bg)은 테마와 무관하게 어둡다. 아이콘은 흰색으로 고정한다. */
  color: #ffffff;
}

.edit-info-view__avatar-label {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-secondary);
}

/*
  아래 avatar-picker 규칙들은 teleport된 팝업 안에서 쓰인다. 이 화면 루트의 변수는
  body로 옮겨간 팝업까지 상속되지 않으므로 공용 테마 토큰만 쓴다.
*/
.avatar-picker {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.avatar-picker__item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 10px;
  border: 1px solid var(--color-border, #262626);
  border-radius: 14px;
  background: var(--color-surface, #161616);
  font: inherit;
  cursor: pointer;
}

/* 고른 항목은 테두리 굵기가 아니라 색과 배경으로 표시한다. 굵기를 바꾸면 칸이 흔들린다. */
.avatar-picker__item--selected {
  border-color: var(--color-heading-accent);
  background: var(--color-primary-soft, #e3ffe8);
}

/* 전신 그림을 그대로 넣으면 얼굴이 작아 구분이 안 된다. 프로필과 같은 상반신 크롭을 쓴다. */
.avatar-picker__thumb {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 32px;
  overflow: hidden;
  background: var(--color-app-bg, #111111);
}

.avatar-picker__img {
  position: absolute;
  height: auto;
}

.edit-info-view__section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.edit-info-view__section-title {
  margin: 0;
  font-size: 13.2px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.edit-info-view__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.edit-info-view__field-label-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.edit-info-view__field-label {
  color: var(--color-text-primary);
  font-weight: 500;
}

/*
  BaseOptionCardGroup은 글자색이 변수가 아니라 #e6e9e6으로 박혀 있어서 변수로는
  덮을 수 없다. 공용 컴포넌트를 고치지 않고 이 화면에서만 :deep()으로 바꾼다.
  고른 카드 규칙을 뒤에 둬야 순서상 이긴다.
*/
.edit-info-view :deep(.option-card-group__item .option-card-group__label) {
  color: var(--color-text-primary);
}

.edit-info-view :deep(.option-card-group__item .option-card-group__sublabel) {
  color: var(--color-text-secondary);
}

/* 고른 카드는 테두리를 없애도록 돼 있어 혼자 선이 빠져 보인다. 다른 칸과 같은 선을 준다. */
.edit-info-view :deep(.option-card-group__item--active) {
  border-color: var(--color-border);
}

.edit-info-view :deep(.option-card-group__item--active .option-card-group__label) {
  color: var(--color-mint-deep, #16281c);
}

.edit-info-view :deep(.option-card-group__item--active .option-card-group__sublabel) {
  color: #5c7a63;
}

.edit-info-view__field-helper {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-secondary);
}

/*
  직업군은 아홉 개다. 소득 분위와 같은 카드로 두면 아홉 칸이 세로로 쌓여 화면이
  너무 길어진다. 글자 폭만큼만 차지하는 칩으로 두고 줄바꿈시킨다.
*/
.edit-info-view__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/*
  버튼 기본 스타일(여백·테두리·폰트)이 브라우저마다 다르다. 전부 직접 지정한다.
  색은 테마 토큰이라 라이트·다크 모두 따라간다.
*/
.edit-info-view__chip {
  padding: 7px 12px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.2;
  cursor: pointer;
}

/*
  고른 칩은 연한 민트 바탕에 진한 초록 글씨. 바탕색이 양쪽 테마 모두 밝은 쪽이라
  글씨는 고정값으로 둬도 대비가 유지된다.
*/
.edit-info-view__chip--selected {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
  color: var(--color-mint-deep, #16281c);
}

.edit-info-view__footer {
  display: flex;
  justify-content: center;
}
</style>
