<script setup>
defineProps({
  size: { type: Number, default: 12 },
})
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 12 12">
    <path
      d="M4 1L10 6L4 11"
      fill="none"
      stroke="currentColor"
      stroke-width="1.9"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
