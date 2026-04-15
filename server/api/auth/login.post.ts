export default defineEventHandler(async (event) => {
  const body = await readBody<{
    login?: string
    password?: string
    remember?: boolean
  }>(event)

  const login = String(body.login || '').trim()
  const password = String(body.password || '')
  const remember = Boolean(body.remember)

  if (!login || !password) {
    throw createError({
      statusCode: 422,
      statusMessage: "Login va parolni to'ldiring",
    })
  }

  const surveyResult = await loginWithSurveyApi(login, password, remember)

  if (surveyResult?.ok === false) {
    throw createError({
      statusCode: 401,
      statusMessage: surveyResult.message,
    })
  }

  if (surveyResult?.user && surveyResult.user.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Faqat admin foydalanuvchi kira oladi',
    })
  }

  const sqliteResult = surveyResult?.user ? null : authenticateSurveyAdmin(login, password)

  if (sqliteResult?.ok === false) {
    throw createError({
      statusCode: 401,
      statusMessage: sqliteResult.message,
    })
  }

  const user = surveyResult?.user ?? sqliteResult?.user

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "So'rovnoma tizimi admin bazasiga ulanib bo'lmadi",
    })
  }

  setAuthSession(event, user, remember)

  return {
    user,
  }
})
