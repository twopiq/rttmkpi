export const apiUrl = (path: string) => {
  const config = useRuntimeConfig()
  const runtimeBaseUrl = import.meta.client
    ? String(window.__KPI_API_BASE_URL__ || '')
    : ''
  const baseUrl = String(runtimeBaseUrl || config.public.apiBaseUrl || '').replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return `${baseUrl}${normalizedPath}`
}

export const apiAuthHeaders = () => {
  if (!import.meta.client) {
    return {}
  }

  const token = window.localStorage.getItem('kpi.auth.token')

  return token ? { Authorization: `Bearer ${token}` } : {}
}

declare global {
  interface Window {
    __KPI_API_BASE_URL__?: string
  }
}
