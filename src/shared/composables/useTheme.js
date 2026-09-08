import { reactive, readonly, toRefs } from 'vue'

const THEME_STORAGE_KEY = 'theme'
const DEFAULT_THEME = 'light'

const state = reactive({
  theme: DEFAULT_THEME,
})

function readStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : null
  } catch {
    return null
  }
}

function writeStoredTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // 저장 실패해도 화면 동작에는 영향 없음
  }
}

function resolveInitialTheme() {
  const stored = readStoredTheme()
  if (stored) return stored

  if (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark'
  }

  return DEFAULT_THEME
}

function applyTheme(theme) {
  state.theme = theme
  document.documentElement.dataset.theme = theme
}

export function initTheme() {
  applyTheme(resolveInitialTheme())
}

function setTheme(theme) {
  if (theme !== 'light' && theme !== 'dark') return
  applyTheme(theme)
  writeStoredTheme(theme)
}

function toggleTheme() {
  setTheme(state.theme === 'dark' ? 'light' : 'dark')
}

export function useTheme() {
  return {
    ...toRefs(readonly(state)),
    setTheme,
    toggleTheme,
  }
}
