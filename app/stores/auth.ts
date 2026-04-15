import { defineStore } from 'pinia'

type AuthUser = {
  id: string
  name: string
  login: string
  role: string
  source: 'survey-api' | 'survey-sqlite'
}

type AuthResponse = {
  user: AuthUser
  token?: string
}

type LoginPayload = {
  login: string
  password: string
  remember: boolean
}

const STORAGE_KEY = 'kpi.auth.user'
const TOKEN_STORAGE_KEY = 'kpi.auth.token'

const getErrorMessage = (error: unknown) => {
  const payload = error as {
    data?: { statusMessage?: string; message?: string }
    statusMessage?: string
    message?: string
  }

  return payload.data?.statusMessage
    || payload.data?.message
    || payload.statusMessage
    || payload.message
    || "Amalni bajarib bo'lmadi"
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as AuthUser | null,
    status: 'idle' as 'idle' | 'loading',
    error: null as string | null,
    initialized: false,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.user),
    displayName: (state) => state.user?.name || state.user?.login || '',
  },

  actions: {
    hydrateFromStorage() {
      if (!import.meta.client || this.user) {
        return
      }

      const rawUser = window.localStorage.getItem(STORAGE_KEY)

      if (!rawUser) {
        return
      }

      try {
        this.user = JSON.parse(rawUser) as AuthUser
      } catch {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    },

    persistUser() {
      if (!import.meta.client) {
        return
      }

      if (this.user) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.user))
      } else {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    },

    persistToken(token: string | null) {
      if (!import.meta.client) {
        return
      }

      if (token) {
        window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
      } else {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY)
      }
    },

    async login(payload: LoginPayload) {
      this.status = 'loading'
      this.error = null

      try {
        const response = await $fetch<AuthResponse>(apiUrl('/api/auth/login'), {
          method: 'POST',
          body: payload,
        })

        this.user = response.user
        this.initialized = true
        this.persistToken(response.token || null)
        this.persistUser()

        return response.user
      } catch (error) {
        this.user = null
        this.error = getErrorMessage(error)
        this.persistToken(null)
        this.persistUser()
        throw error
      } finally {
        this.status = 'idle'
      }
    },

    async fetchCurrentUser(headers?: HeadersInit) {
      this.status = 'loading'

      try {
        const response = await $fetch<AuthResponse>(apiUrl('/api/auth/me'), {
          headers: {
            ...(headers as Record<string, string> | undefined),
            ...apiAuthHeaders(),
          },
        })

        this.user = response.user
        this.error = null
      } catch {
        this.user = null
      } finally {
        this.initialized = true
        this.status = 'idle'
        this.persistUser()
      }
    },

    async logout() {
      this.status = 'loading'

      try {
        await $fetch(apiUrl('/api/auth/logout'), {
          method: 'POST',
          headers: apiAuthHeaders(),
        })
      } finally {
        this.user = null
        this.initialized = true
        this.status = 'idle'
        this.persistToken(null)
        this.persistUser()
      }
    },
  },
})
