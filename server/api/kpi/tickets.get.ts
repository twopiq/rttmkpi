export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  // Nuxt session fallback (dev mode SQLite login)
  const sessionUser = token ? null : readAuthSession(event)

  if (!token && !sessionUser) {
    throw createError({ statusCode: 401, statusMessage: 'Avtorizatsiya talab qilinadi' })
  }

  const raw = getQuery(event) as Record<string, string>
  const params: Record<string, string> = {}
  const allowed = ['page', 'status', 'priority', 'department_id', 'search', 'from', 'to']
  for (const key of allowed) {
    if (raw[key]) params[key] = raw[key]
  }

  // Try surovnoma API first (if Bearer token available)
  if (token) {
    const apiData = await fetchKpiTicketsFromApi(token, params)
    if (apiData) return apiData
  }

  // SQLite fallback
  const data = fetchKpiTicketsFromSqlite({
    page: params.page ? Number(params.page) : 1,
    status: params.status,
    priority: params.priority,
    departmentId: params.department_id,
    search: params.search,
    from: params.from,
    to: params.to,
  })

  if (!data) {
    throw createError({ statusCode: 503, statusMessage: "Ma'lumot olib bo'lmadi" })
  }

  return data
})
