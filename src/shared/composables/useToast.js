import { reactive } from 'vue'

const state = reactive({
  toasts: [],
})

let nextId = 0

function show(message, { type = 'info', duration = 3000, position = 'center' } = {}) {
  const id = nextId++
  state.toasts.push({ id, message, type, position })

  setTimeout(() => remove(id), duration)
}

function remove(id) {
  const index = state.toasts.findIndex((toast) => toast.id === id)
  if (index !== -1) state.toasts.splice(index, 1)
}

export function useToast() {
  return { toasts: state.toasts, show, remove }
}
