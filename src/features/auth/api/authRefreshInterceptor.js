import httpClient from '@/shared/api/httpClient'
import { loadAuthSession, saveAuthSession, clearAuthSession } from '@/shared/utils/authSession'

import { refreshAccessToken } from '@/features/auth/api/authApi'

const REFRESH_URL = '/api/v1/auth/refresh'
const LOGIN_PATH = '/login'

let refreshPromise = null

function isRefreshRequest(config) {
  return config?.url === REFRESH_URL
}

export function registerAuthRefreshInterceptor() {
  httpClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const { config, response } = error

      if (response?.status !== 401 || isRefreshRequest(config) || config._retriedAfterRefresh) {
        return Promise.reject(error)
      }

      const { refreshToken } = loadAuthSession()
      if (!refreshToken) {
        return Promise.reject(error)
      }

      try {
        refreshPromise ??= refreshAccessToken(refreshToken).finally(() => {
          refreshPromise = null
        })
        const { accessToken, refreshToken: nextRefreshToken } = await refreshPromise

        saveAuthSession({ ...loadAuthSession(), accessToken, refreshToken: nextRefreshToken })

        config._retriedAfterRefresh = true
        config.headers.Authorization = `Bearer ${accessToken}`
        return httpClient(config)
      } catch (refreshError) {
        clearAuthSession()
        window.location.replace(LOGIN_PATH)
        return Promise.reject(refreshError)
      }
    },
  )
}
