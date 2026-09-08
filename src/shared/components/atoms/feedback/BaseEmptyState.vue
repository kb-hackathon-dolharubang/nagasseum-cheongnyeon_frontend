<script setup>
defineProps({
  message: { type: String, default: '아직 준비 중이에요' },
})
</script>

<template>
  <div class="base-empty-state">
    <p class="base-empty-state__message">{{ message }}</p>
  </div>
</template>

<style scoped>
.base-empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  color: var(--text, #9aa09a);
  font-size: 14px;
  text-align: center;
}
</style>
