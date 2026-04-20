import { z } from 'zod'
import { DateTime } from 'luxon'
import { getLocalDb, getDsqlDb, type DbConnection } from '~~/server/db'

export const micropostBodySchema = z.object({
  bodyText: z.string().nonempty(),
})

export function generateSlug(): string {
  return `micropost-${DateTime.now().toFormat('yyyyMMdd-HHmmss')}`
}

export async function useDb(): Promise<DbConnection> {
  if (import.meta.dev && !process.env.USE_DSQL) {
    return getLocalDb()
  }
  return getDsqlDb()
}
