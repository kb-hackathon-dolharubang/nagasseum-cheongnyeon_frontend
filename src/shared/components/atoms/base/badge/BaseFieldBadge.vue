<script setup>
defineProps({
  required: { type: Boolean, default: true },
})
</script>

<template>
  <span class="base-field-badge" :class="{ 'base-field-badge--optional': !required }">
    {{ required ? '필수' : '선택' }}
  </span>
</template>

<style scoped>
.base-field-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 17px;
  padding: 0 8px;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1;
  background: #3a1f1f;
  color: #ff6b6b;
}

.base-field-badge--optional {
  background: #1e211f;
  color: var(--text, #9aa09a);
}
</style>
