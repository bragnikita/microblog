import { z } from "zod"

export default defineEventHandler(async (event) => {
    const { key } = await readValidatedBody(event, z.object({
        key: z.string().nonempty()
    }).parse)
    if (key !== process.env.FAST_ACCESS_KEY) {
        return {
            ok: false,
            message: 'Invalid key'
        }
    }
    await setUserSession(event, { user: { login: 'admin'} })
    return {
        ok: true,
        message: 'Success'
    }
})