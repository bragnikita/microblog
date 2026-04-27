import { z } from 'zod'
import { DateTime } from 'luxon'
import { useDb } from '~~/server/db'

export { useDb }

export const micropostBodySchema = z.object({
  bodyText: z.string().nonempty(),
})

export const micropostCreateSchema = z.object({
  content: z.string().nonempty(),
  images: z.array(z.string().uuid()).default([]),
})

export const micropostUpdateSchema = z.object({
  content: z.string().nonempty(),
  images: z.array(z.string().uuid()).default([]),
})

export function generateSlug(): string {
  return `micropost-${DateTime.now().toFormat('yyyyMMdd-HHmmss')}`
}
