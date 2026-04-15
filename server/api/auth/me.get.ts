export default defineEventHandler((event) => {
  const user = readAuthSession(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Sessiya topilmadi',
    })
  }

  return {
    user,
  }
})
