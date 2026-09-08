<script setup>
defineProps({
  width: { type: String, default: '100%' },
  height: { type: String, default: '16px' },
  radius: { type: String, default: '8px' },
})
</script>

<template>
  <div class="skeleton" :style="{ width, height, borderRadius: radius }" />
</template>

<style scoped>
.skeleton {
  background: linear-gradient(90deg, #1c1c1c 25%, #262626 37%, #1c1c1c 63%);
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.4s ease infinite;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}
</style>
