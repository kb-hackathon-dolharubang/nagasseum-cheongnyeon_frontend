export function registerErrorHandler(client) {
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('[API Error]', error.response?.status, error.response?.data ?? error.message)
      return Promise.reject(error)
    },
  )
}
