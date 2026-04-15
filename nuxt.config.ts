// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  runtimeConfig: {
    surveyApiBaseUrl: process.env.SURVEY_API_BASE_URL || 'http://127.0.0.1:8000',
    surveySqlitePath: process.env.SURVEY_SQLITE_PATH || '../surovnoma_sayt/database/database.sqlite',
    kpiSessionSecret: process.env.KPI_SESSION_SECRET || 'local-kpi-session-secret',
    public: {
      appName: 'KPI tizimi',
    },
  },
})
