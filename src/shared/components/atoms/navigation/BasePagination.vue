<script setup>
const props = defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true },
})

const emit = defineEmits(['update:page'])

function goTo(page) {
  if (page < 1 || page > props.totalPages || page === props.page) return
  emit('update:page', page)
}
</script>

<template>
  <nav class="base-pagination">
    <button type="button" :disabled="page <= 1" @click="goTo(page - 1)">이전</button>
    <span>{{ page }} / {{ totalPages }}</span>
    <button type="button" :disabled="page >= totalPages" @click="goTo(page + 1)">다음</button>
  </nav>
</template>

<style scoped>
.base-pagination {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
