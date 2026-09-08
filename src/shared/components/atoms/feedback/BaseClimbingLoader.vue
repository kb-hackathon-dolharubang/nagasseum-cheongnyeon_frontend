<script setup>
import climberImage from '@/assets/images/climber.png'
</script>

<template>
  <div class="base-climbing-loader">
    <img class="base-climbing-loader__climber" :src="climberImage" alt="" />
    <div class="base-climbing-loader__track">
      <span class="base-climbing-loader__bar" />
    </div>
  </div>
</template>

<style scoped>
.base-climbing-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  width: 100%;
  max-width: 240px;
}

.base-climbing-loader__climber {
  width: 56px;
  height: 56px;
  image-rendering: pixelated;
  animation: base-climbing-loader-hop 0.9s ease-in-out infinite;
}

.base-climbing-loader__track {
  position: relative;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: var(--color-progress-inactive, #262626);
  overflow: hidden;
}

.base-climbing-loader__bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 40%;
  height: 100%;
  border-radius: 2px;
  background: var(--base-button-primary-bg, #e3ffe8);
  animation: base-climbing-loader-slide 1.4s ease-in-out infinite;
}

@keyframes base-climbing-loader-hop {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes base-climbing-loader-slide {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(250%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .base-climbing-loader__climber,
  .base-climbing-loader__bar {
    animation: none;
  }
  .base-climbing-loader__bar {
    width: 100%;
  }
}
</style>
