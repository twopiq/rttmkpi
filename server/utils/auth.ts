import { createHmac, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import { deleteCookie, getCookie, setCookie } from 'h3'

const AUTH_COOKIE = 'kpi_auth_session'

export type AuthUser = {
  id: string
  name: string
  login: string
  role: string
  source: 'survey-api' | 'survey-sqlite'
}

type SessionPayload = AuthUser & {
  issuedAt: number
}

const sign = (value: string) => {
  const config = useRuntimeConfig()
  const secret = String(config.kpiSessionSecret || 'local-kpi-session-secret')

  return createHmac('sha256', secret).update(value).digest('base64url')
}

const encodePayload = (payload: SessionPayload) => Buffer
  .from(JSON.stringify(payload), 'utf8')
  .toString('base64url')

const decodePayload = (value: string): SessionPayload | null => {
  try {
    return JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as SessionPayload
  } catch {
    return null
  }
}

const verifySignature = (payload: string, signature: string) => {
  const expected = sign(payload)
  const left = Buffer.from(signature)
  const right = Buffer.from(expected)

  return left.length === right.length && timingSafeEqual(left, right)
}

export const createSessionCookie = (user: AuthUser) => {
  const payload = encodePayload({
    ...user,
    issuedAt: Date.now(),
  })

  return `${payload}.${sign(payload)}`
}

export const readAuthSession = (event: H3Event): AuthUser | null => {
  const cookie = getCookie(event, AUTH_COOKIE)

  if (!cookie) {
    return null
  }

  const [payload, signature] = cookie.split('.')

  if (!payload || !signature || !verifySignature(payload, signature)) {
    return null
  }

  const session = decodePayload(payload)

  if (!session) {
    return null
  }

  return {
    id: session.id,
    name: session.name,
    login: session.login,
    role: session.role,
    source: session.source,
  }
}

export const setAuthSession = (event: H3Event, user: AuthUser, remember = false) => {
  setCookie(event, AUTH_COOKIE, createSessionCookie(user), {
    httpOnly: true,
    maxAge: remember ? 60 * 60 * 24 * 14 : 60 * 60 * 8,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}

export const clearAuthSession = (event: H3Event) => {
  deleteCookie(event, AUTH_COOKIE, {
    path: '/',
  })
}
