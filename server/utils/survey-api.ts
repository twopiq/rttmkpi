import type { AuthUser } from './auth'

type SurveyLoginResult =
  | { ok: true, user: AuthUser }
  | { ok: false, message: string }
  | null

type KpiSummary = {
  source: 'survey-api' | 'survey-sqlite' | 'local-placeholder'
  updatedAt: string
  stats: Array<{
    key: string
    label: string
    value: string | number
    description: string
  }>
  employeeResults: Array<{
    label: string
    value: number
  }>
  indicators: Array<{
    label: string
    value: number
    hex: string
  }>
}

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

  if (!baseUrl) {
    return null
  }

  try {
    const response = await $fetch<Record<string, unknown>>(`${baseUrl}/api/kpi/auth/login`, {
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
    }
  } catch (error) {
    const status = Number((error as { response?: { status?: number } }).response?.status)

    if (status === 401 || status === 422) {
      return {
        ok: false,
        message: "Login yoki parol noto'g'ri",
      }
    }

    return null
  }
}

export const fetchSurveyKpiSummary = async (): Promise<KpiSummary | null> => {
  const baseUrl = surveyApiBase()

  if (!baseUrl) {
    return null
  }

  try {
    return await $fetch<KpiSummary>(`${baseUrl}/api/kpi/summary`, {
      timeout: 5000,
    })
  } catch {
    return null
  }
}
