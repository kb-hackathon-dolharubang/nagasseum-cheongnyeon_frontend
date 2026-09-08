<script setup>
import { computed } from 'vue'

const props = defineProps({
  institution: { type: Object, required: true },
  as: { type: String, default: 'div' },
  selected: { type: Boolean, default: false },
})

defineEmits(['click'])

const shortLabel = computed(() => props.institution.shortName ?? props.institution.name.slice(0, 2))
</script>

<template>
  <component
    :is="as"
    :type="as === 'button' ? 'button' : undefined"
    :aria-pressed="as === 'button' ? selected : undefined"
    class="institution-card"
    :class="{ 'institution-card--selected': selected }"
    @click="$emit('click')"
  >
    <span class="institution-card__logo">{{ shortLabel }}</span>

    <span class="institution-card__info">
      <span class="institution-card__name">{{ institution.name }}</span>
      <span class="institution-card__category">{{ institution.category }}</span>
    </span>

    <slot name="action" />
  </component>
</template>

<style scoped>
/*
  legacy --card-bg / --border / --text-h는 main.css의 [data-theme] 블록에 없어서
  테마를 따라가지 않는다(--card-bg는 아예 정의도 없어 항상 #161616으로 떨어졌다).
  공용 시맨틱 토큰으로 바꿔 라이트·다크 모두 따라가게 한다.
*/
.institution-card {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: var(--color-surface);
  text-align: left;
}

.institution-card--selected {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
}

/*
  선택 배경(--color-primary-soft)은 테마와 무관하게 항상 밝은 민트 톤이라,
  테마를 따라가는 --color-text-primary(다크에서 흰색)를 쓰면 다크 모드에서
  텍스트가 배경에 묻혀 안 보인다. 체크 아이콘과 동일하게 고정 잉크색을 쓴다.
*/
.institution-card--selected .institution-card__name,
.institution-card--selected .institution-card__category {
  color: var(--color-mint-deep);
}

.institution-card__logo {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--color-border);
  font-size: 13.2px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.institution-card__info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.institution-card__name {
  font-size: 14.1px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.institution-card__category {
  font-size: 11.1px;
  color: var(--color-text-secondary);
}
</style>
