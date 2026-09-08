<script setup>
defineProps({
  fullHeight: { type: Boolean, default: false },
})
</script>

<template>
  <div class="mobile-container" :class="{ 'mobile-container--full-height': fullHeight }">
    <slot />
  </div>
</template>

<style scoped>
.mobile-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.mobile-container--full-height {
  position: relative;
  min-height: 100vh;
  background: var(--color-app-bg, #111111);
}
</style>
