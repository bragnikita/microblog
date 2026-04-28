import { z } from 'zod'
import { DateTime } from 'luxon'
import { useDb } from '~~/server/db'

export { useDb }


const visibilitySchema = z.enum(['public', 'private']).default('public')
const statusSchema = z.enum(['published', 'draft', 'archived']).default('published')

export const micropostCreateSchema = z.object({
  content: z.string().nonempty(),
  images: z.array(z.string().uuid()).default([]),
  visibility: visibilitySchema,
  status: statusSchema,
})

export const micropostUpdateSchema = z.object({
  content: z.string().nonempty(),
  images: z.array(z.string().uuid()).default([]),
  visibility: visibilitySchema,
  status: statusSchema,
})

export function generateSlug(): string {
  return `micropost-${DateTime.now().toFormat('yyyyMMdd-HHmmss')}`
}
