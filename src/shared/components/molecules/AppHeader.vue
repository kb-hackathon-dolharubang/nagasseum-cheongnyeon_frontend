<script setup>
defineProps({
  title: { type: String, default: '' },
  showBack: { type: Boolean, default: true },
  // 'center'(기본): 기존처럼 제목이 항상 화면 정중앙. 'start': 채팅 헤더처럼 뒤로가기
  // 바로 옆에 왼쪽 정렬(프로필+이름+상태 배지 등 폭이 가변적인 내용에 적합).
  titleAlign: { type: String, default: 'center' },
})

defineEmits(['back'])
</script>

<template>
  <header class="app-header" :class="{ 'app-header--title-start': titleAlign === 'start' }">
    <button
      v-if="showBack"
      type="button"
      class="app-header__back"
      aria-label="뒤로가기"
      @click="$emit('back')"
    >
      <svg viewBox="0 0 12 12" width="12" height="12">
        <path
          d="M8 1L2 6L8 11"
          fill="none"
          stroke="currentColor"
          stroke-width="1.9"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
    <span v-else class="app-header__spacer" />
    <!-- title 슬롯은 채팅 화면처럼 가운데 칸에 프로필/상태 배지 같은 커스텀 내용이
         필요할 때만 쓴다. 슬롯을 안 넘기면 기존처럼 title prop 텍스트가 그대로 나온다. -->
    <slot name="title">
      <h1 class="app-header__title">{{ title }}</h1>
    </slot>
    <!-- 3열 grid라 좌/우 폭이 달라도(예: "수정하기") 제목은 항상 가운데 칸에 고정된다 -->
    <div class="app-header__action">
      <slot name="action" />
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  width: 100%;
  padding: 3px 0 12px;
  position: sticky;
  top: 0;
  z-index: 5;
  background: var(--color-app-bg, #111111);
  border-bottom: 1px solid var(--color-border, #262626);
}

/* 가운데 칸을 남는 폭을 다 가져가는 1fr로 바꾸고 그 안 내용을 왼쪽 정렬한다 -
   auto 폭 그대로면 칸 자체가 좌우 1fr 사이에서 가운데에 위치해 여전히 화면
   중앙으로 보인다. */
.app-header--title-start {
  grid-template-columns: auto 1fr auto;
}

.app-header--title-start .app-header__title {
  text-align: left;
}

.app-header__back {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  justify-self: start;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: none;
  color: var(--color-text-primary, #ffffff);
  cursor: pointer;
}

.app-header__back::before {
  content: '';
  position: absolute;
  inset: -8px;
}

.app-header__title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text-primary, #ffffff);
}

.app-header__spacer {
  width: 24px;
  height: 24px;
  justify-self: start;
}

.app-header__action {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 24px;
  height: 24px;
  justify-self: end;
}
</style>
