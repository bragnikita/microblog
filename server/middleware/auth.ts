export default defineEventHandler(async (event) => {
    if (event.path === '/api/login' || event.path === '/api/_auth/session') {
        return
    }
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(event.method.toUpperCase())) {
        await requireUserSession(event)
    }
})
