export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const query = getQuery(event) as Record<string, string>

  if (token) {
    const params: Record<string, string> = {}
    if (query.month) params.month = query.month
    const apiData = await fetchKpiDashboardFromApi(token, Object.keys(params).length ? params : undefined)
    if (apiData) return apiData
  }

  const data = fetchKpiDashboardData()
  if (!data) {
    throw createError({ statusCode: 503, statusMessage: "So'rovnoma bazasidan ma'lumot olib bo'lmadi" })
  }
  return data
})
