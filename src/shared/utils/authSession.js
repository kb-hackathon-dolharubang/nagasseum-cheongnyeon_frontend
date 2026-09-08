const STORAGE_KEY = 'auth-session'

export function loadAuthSession() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) ?? {}
  } catch {
    return {}
  }
}

export function saveAuthSession(session) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearAuthSession() {
  sessionStorage.removeItem(STORAGE_KEY)
}
