export default defineEventHandler(() => {
  const data = fetchKpiDashboardData()

  if (!data) {
    throw createError({
      statusCode: 503,
      statusMessage: "So'rovnoma bazasidan ma'lumot olib bo'lmadi",
    })
  }

  return data
})
