const publicAdminPages = new Set([
  '/admin/login',
  '/admin/forgot-password',
  '/admin/reset-password'
])

export default defineNuxtRouteMiddleware(async (to) => {
  const isAdminPage = to.path === '/admin' || to.path.startsWith('/admin/')

  if (!isAdminPage || publicAdminPages.has(to.path)) {
    return
  }

  const { user, initialize, logout, isAuthenticated } = useAuth()

  if (!user.value) {
    return navigateTo('/admin/login', { replace: true })
  }

  await initialize()

  if (!isAuthenticated.value) {
    await logout()
    return navigateTo('/admin/login', { replace: true })
  }
})
