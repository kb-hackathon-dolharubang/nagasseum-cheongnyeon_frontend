<script setup>
import MobileContainer from '@/shared/components/molecules/MobileContainer.vue'
</script>

<template>
  <div class="auth-layout">
    <MobileContainer>
      <RouterView />
    </MobileContainer>
  </div>
</template>

<style scoped>
.auth-layout {
  /* "필수" "선택" 뱃지도 색이 박혀 있다. 기본값은 다크로 두고 라이트만 덮는다. */
  --badge-required-bg: #3a1f1f;
  --badge-required-ink: #ff6b6b;
  --badge-optional-bg: #1e211f;

  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-app-bg);
}

:root[data-theme='light'] .auth-layout {
  --badge-required-bg: #fdeeea;
  --badge-required-ink: #c1442e;
  --badge-optional-bg: #eff1eb;
}

.auth-layout :deep(.base-field-badge) {
  background: var(--badge-required-bg);
  color: var(--badge-required-ink);
}

.auth-layout :deep(.base-field-badge--optional) {
  background: var(--badge-optional-bg);
  color: var(--color-text-secondary);
}

/*
  BaseOptionCardGroup은 글자색이 변수가 아니라 #e6e9e6으로 박혀 있어 변수로는 못 덮는다.
  고른 카드 규칙을 뒤에 둬야 순서상 이긴다.
*/
.auth-layout :deep(.option-card-group__item .option-card-group__label) {
  color: var(--color-text-primary);
}

.auth-layout :deep(.option-card-group__item .option-card-group__sublabel) {
  color: var(--color-text-secondary);
}

.auth-layout :deep(.option-card-group__item--active) {
  border-color: var(--color-border);
}

.auth-layout :deep(.option-card-group__item--active .option-card-group__label) {
  color: var(--color-mint-deep, #16281c);
}

.auth-layout :deep(.option-card-group__item--active .option-card-group__sublabel) {
  color: #5c7a63;
}
</style>
