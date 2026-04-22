import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { schema } from '~~/server/db'
import { useDb } from './_utils'

export default defineWrappedResponseHandler(async (event) => {
  const id = z.string().uuid().parse(getRouterParam(event, 'id'))
  const { db, cleanup } = await useDb()
  try {
    await db
      .delete(schema.contentCategories)
      .where(eq(schema.contentCategories.categoryId, id))

    const [deleted] = await db
      .delete(schema.categories)
      .where(eq(schema.categories.id, id))
      .returning({ id: schema.categories.id })

    if (!deleted) {
      throw createError({ statusCode: 404, statusMessage: 'Category not found' })
    }

    return { ok: true }
  } finally {
    await cleanup()
  }
})
