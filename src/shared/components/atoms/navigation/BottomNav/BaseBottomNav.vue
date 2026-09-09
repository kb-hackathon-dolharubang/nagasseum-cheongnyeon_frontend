<script setup>
defineProps({
  items: { type: Array, required: true },
  modelValue: { type: Number, default: 0 },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <nav class="bottom-nav">
    <button
      v-for="(item, index) in items"
      :key="item.label"
      type="button"
      class="bottom-nav__item"
      :class="{ 'bottom-nav__item--active': index === modelValue }"
      @click="$emit('update:modelValue', index)"
    >
      <span class="bottom-nav__icon">
        <component :is="item.icon" v-if="item.icon" />
      </span>
      <span class="bottom-nav__label">{{ item.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 5px;
  border-radius: 26px;
  background: var(--color-nav-bg, #a6c7b7);
  box-shadow:
    0 -2px 8px rgba(0, 0, 0, 0.05),
    0 3px 10px rgba(0, 0, 0, 0.09);
  box-sizing: border-box;
}

.bottom-nav__item {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 6px 8px;
  border: none;
  border-radius: 20px;
  background: transparent;
  color: var(--color-nav-inactive, #3e5a49);
  cursor: pointer;
  transition: color 0.18s ease;
}

.bottom-nav__item--active {
  color: var(--color-nav-active, #16281c);
}

.bottom-nav__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
}

.bottom-nav__item--active .bottom-nav__icon {
  animation: bottom-nav-icon-pop 0.28s ease;
}

@keyframes bottom-nav-icon-pop {
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.18);
  }
  100% {
    transform: scale(1);
  }
}

.bottom-nav__icon :deep(svg) {
  width: 100%;
  height: 100%;
}

/* 배경 박스 대신, 활성 탭은 아이콘을 채워서(선 외곽선 -> 단색 실루엣) 표시한다.
   글자색과 같은 색(currentColor)이라 별도 색상 지정 없이 .bottom-nav__item--active의
   color만 따라간다. */
.bottom-nav__item--active .bottom-nav__icon :deep(svg) {
  fill: currentColor;
}

/* 아이콘 전체를 감싸는 겉 외곽선(예: 집 모양, 사각형 테두리)은 그대로 채움색과
   같은 색으로 둬서 실루엣처럼 보이게 하고, 아이콘 "안쪽"의 디테일 선/점만 흰색으로
   올려 도드라지게 한다 - icons.js에서 안쪽 요소에만 nav-icon-detail/nav-icon-dot
   클래스를 붙여뒀다. 점은 stroke가 원래 없어서(기본값 none) stroke를 건드리면
   얇은 흰 테두리가 생기므로 fill만 바꾼다. */
.bottom-nav__item--active .bottom-nav__icon :deep(svg .nav-icon-detail) {
  stroke: #ffffff;
}

.bottom-nav__item--active .bottom-nav__icon :deep(svg .nav-icon-dot) {
  fill: #ffffff;
}

.bottom-nav__label {
  font-family: var(--sans-normal);
  font-size: 11.5px;
  font-weight: 700;
  white-space: nowrap;
}
</style>
