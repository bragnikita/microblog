import { z } from 'zod'
import { useDb } from '~~/server/db'

export { useDb }

export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'] as const

export const uploadRequestSchema = z.object({
    mimeType: z.enum(ALLOWED_MIME_TYPES),
    originalFilename: z.string().nonempty(),
})

export const photosListQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(30),
    cursor: z.string().uuid().optional(),
})
