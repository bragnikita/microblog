import type { EventHandler, EventHandlerRequest } from 'h3'
import { z, ZodError } from 'zod'

export const defineWrappedResponseHandler = <T extends EventHandlerRequest, D>(
    handler: EventHandler<T, D>
): EventHandler<T, D> =>
    defineEventHandler<T>(async event => {
        try {
            // do something before the route handler
            const response = await handler(event)
            // do something after the route handler
            return response
        } catch (err) {
            // Error handling
            if (err instanceof ZodError) {
                setResponseStatus(event, 400)
                return {
                    message: 'Invalid request',
                    details: err.errors,
                }
            }
            return { err }
        }
    })