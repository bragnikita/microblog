import { z } from 'zod'
import { useDb } from '~~/server/db'

export { useDb }

export const categoryBodySchema = z.object({
  slug: z.string().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case'),
  name: z.string().min(1).max(120),
  descriptionText: z.string().nullable().optional(),
  parentCategoryId: z.string().uuid().nullable().optional(),
  sortOrder: z.number().int().default(0),
  visibility: z.enum(['public', 'private']).default('public'),
})
