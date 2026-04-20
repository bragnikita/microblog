import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { schema } from '~~/server/db'
import { useDb } from './_utils'

export default defineWrappedResponseHandler(async (event) => {
  const id = z.string().uuid().parse(getRouterParam(event, 'id'))
  const { db, cleanup } = await useDb()
  try {
    const [deleted] = await db
      .delete(schema.contents)
      .where(
        and(
          eq(schema.contents.id, id),
          eq(schema.contents.contentType, 'micropost'),
        ),
      )
      .returning({ id: schema.contents.id })

    if (!deleted) {
      throw createError({ statusCode: 404, statusMessage: 'Post not found' })
    }

    return { ok: true }
  } finally {
    await cleanup()
  }
})
