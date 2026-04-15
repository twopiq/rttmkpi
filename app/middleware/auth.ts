export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore()

  if (!auth.initialized) {
    const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined

    await auth.fetchCurrentUser(headers)
  }

  if (!auth.isAuthenticated) {
    return navigateTo('/')
  }
})
