export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const sessionUser = token ? null : readAuthSession(event)

  if (!token && !sessionUser) {
    throw createError({ statusCode: 401, statusMessage: 'Avtorizatsiya talab qilinadi' })
  }

  if (token) {
    const data = await fetchKpiAnalyticsFromApi(token)
    if (data) return data
  }

  // SQLite fallback: return basic analytics from existing dashboard data
  const dash = fetchKpiDashboardData()
  if (!dash) {
    throw createError({ statusCode: 503, statusMessage: "Tahlil ma'lumotlarini olib bo'lmadi" })
  }

  return {
    trend: [],
    byDepartment: [],
    byCategory: [],
    byChannel: [],
    byPriority: [],
    byWeekday: [],
    _note: 'SQLite rejimida tahlil ma\'lumotlari cheklangan',
  }
})
