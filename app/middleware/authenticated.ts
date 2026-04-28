export default defineNuxtRouteMiddleware((to, from) => {
    const { loggedIn } = useUserSession()
    if (!loggedIn.value) {
        throw createError({ statusCode: 404, statusMessage: 'Page not found' })
    }
})