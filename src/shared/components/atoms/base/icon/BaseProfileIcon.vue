<script setup>
defineProps({
  size: { type: Number, default: 24 },
})
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="4" fill="currentColor" />
    <path d="M4 21C4 16.5817 7.58172 13 12 13C16.4183 13 20 16.5817 20 21" fill="currentColor" />
  </svg>
</template>
