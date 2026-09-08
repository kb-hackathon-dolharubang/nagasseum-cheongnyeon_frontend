<script setup>
defineProps({
  size: { type: Number, default: 14 },
})
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 17 17" fill="none">
    <path
      d="M2 8L8.5 2.5L15 8V15H10.5V10.5H6.5V15H2V8Z"
      stroke="currentColor"
      stroke-width="1.4"
      stroke-linejoin="round"
    />
  </svg>
</template>
