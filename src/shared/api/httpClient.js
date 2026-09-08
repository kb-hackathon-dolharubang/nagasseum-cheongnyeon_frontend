import axios from 'axios'
import { registerErrorHandler } from './errorHandler'
import { loadAuthSession } from '@/shared/utils/authSession'

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000000,
})

httpClient.interceptors.request.use((config) => {
  const { accessToken } = loadAuthSession()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

registerErrorHandler(httpClient)

export default httpClient
