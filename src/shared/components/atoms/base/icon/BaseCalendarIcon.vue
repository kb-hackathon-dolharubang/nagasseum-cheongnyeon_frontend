<script setup>
defineProps({
  size: { type: Number, default: 14 },
})
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 16 16" fill="none">
    <rect
      x="2.5"
      y="3.5"
      width="11"
      height="10"
      rx="1.5"
      stroke="currentColor"
      stroke-width="1.3"
    />
    <path d="M2.5 6.5H13.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
    <path
      d="M5.5 2V4.2M10.5 2V4.2"
      stroke="currentColor"
      stroke-width="1.3"
      stroke-linecap="round"
    />
  </svg>
</template>
