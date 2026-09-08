import { ref } from 'vue'

export function useModal(initialValue = false) {
  const isOpen = ref(initialValue)

  function open() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  function toggle() {
    isOpen.value = !isOpen.value
  }

  return { isOpen, open, close, toggle }
}
