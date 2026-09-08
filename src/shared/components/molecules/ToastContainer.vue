<script setup>
import BaseToast from '@/shared/components/atoms/feedback/BaseToast.vue'
import { useToast } from '@/shared/composables/useToast'

const { toasts } = useToast()
</script>

<template>
  <BaseToast
    v-for="toast in toasts"
    :key="toast.id"
    :model-value="true"
    :variant="toast.type"
    :position="toast.position ?? 'center'"
  >
    {{ toast.message }}
  </BaseToast>
</template>
