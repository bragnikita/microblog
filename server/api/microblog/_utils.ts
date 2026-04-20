import { z } from 'zod'
import { DateTime } from 'luxon'
import { useDb } from '~~/server/db'

export { useDb }

export const micropostBodySchema = z.object({
  bodyText: z.string().nonempty(),
})

export function generateSlug(): string {
  return `micropost-${DateTime.now().toFormat('yyyyMMdd-HHmmss')}`
}
