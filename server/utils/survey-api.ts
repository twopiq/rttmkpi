import type { KpiDashboardData } from './kpi-dashboard'

type SurveyLoginResult =
  | { ok: true; user: AuthUser; token: string }
  | { ok: false; message: string }
  | null

const surveyApiBase = () => {
  const config = useRuntimeConfig()
  return String(config.surveyApiBaseUrl || '').replace(/\/+$/, '')
}

const normalizeUser = (payload: Record<string, unknown>, login: string): AuthUser => ({
  id: String(payload.id ?? payload.user_id ?? login),
  name: String(payload.name ?? payload.full_name ?? login),
  login: String(payload.login ?? payload.email ?? login),
  role: String(payload.role ?? 'admin'),
  source: 'survey-api',
})

export const loginWithSurveyApi = async (
  login: string,
  password: string,
  remember: boolean,
): Promise<SurveyLoginResult> => {
  const baseUrl = surveyApiBase()
  if (!baseUrl) return null

  try {
    const response = await $fetch<Record<string, unknown>>(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      body: { login, password, remember },
      timeout: 4000,
    })

    const userPayload = (
      response.user
      || (response.data as Record<string, unknown> | undefined)?.user
      || response
    ) as Record<string, unknown>

    return {
      ok: true,
      user: normalizeUser(userPayload, login),
      token: String(response.token || ''),
    }
  } catch (error) {
    const status = Number((error as { response?: { status?: number } }).response?.status)
    if (status === 401 || status === 422 || status === 403) {
      const data = (error as { data?: { message?: string } }).data
      return { ok: false, message: data?.message || "Login yoki parol noto'g'ri" }
    }
    return null
  }
}

export const fetchKpiDashboardFromApi = async (
  token: string,
  params?: Record<string, string>,
): Promise<KpiDashboardData | null> => {
  const baseUrl = surveyApiBase()
  if (!baseUrl || !token) return null

  try {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return await $fetch<KpiDashboardData>(`${baseUrl}/api/kpi/dashboard${query}`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000,
    })
  } catch {
    return null
  }
}

export const fetchKpiTicketsFromApi = async (
  token: string,
  params?: Record<string, string>,
): Promise<Record<string, unknown> | null> => {
  const baseUrl = surveyApiBase()
  if (!baseUrl || !token) return null

  try {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return await $fetch<Record<string, unknown>>(`${baseUrl}/api/kpi/tickets${query}`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000,
    })
  } catch {
    return null
  }
}

export const fetchKpiAnalyticsFromApi = async (
  token: string,
): Promise<Record<string, unknown> | null> => {
  const baseUrl = surveyApiBase()
  if (!baseUrl || !token) return null

  try {
    return await $fetch<Record<string, unknown>>(`${baseUrl}/api/kpi/analytics`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 6000,
    })
  } catch {
    return null
  }
}
