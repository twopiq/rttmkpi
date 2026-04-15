// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2025-07-15',
  app: {
    head: {
      script: [
        {
          src: '/config.js',
        },
      ],
    },
  },
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
  modules: ['@pinia/nuxt'],
  nitro: {
    preset: 'static',
  },
  runtimeConfig: {
    surveyApiBaseUrl: process.env.SURVEY_API_BASE_URL || 'http://127.0.0.1:8000',
    surveySqlitePath: process.env.SURVEY_SQLITE_PATH || '../surovnoma_sayt/database/database.sqlite',
    kpiSessionSecret: process.env.KPI_SESSION_SECRET || 'local-kpi-session-secret',
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || '',
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'KPI tizimi',
    },
  },
})
