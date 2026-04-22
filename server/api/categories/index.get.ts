import { asc } from 'drizzle-orm'
import { schema } from '~~/server/db'
import { useDb } from './_utils'

export default defineWrappedResponseHandler(async (_event) => {
  const { db, cleanup } = await useDb()
  try {
    return await db
      .select({
        id: schema.categories.id,
        slug: schema.categories.slug,
        name: schema.categories.name,
        descriptionText: schema.categories.descriptionText,
        parentCategoryId: schema.categories.parentCategoryId,
        sortOrder: schema.categories.sortOrder,
        visibility: schema.categories.visibility,
        createdAt: schema.categories.createdAt,
        updatedAt: schema.categories.updatedAt,
      })
      .from(schema.categories)
      .orderBy(asc(schema.categories.sortOrder), asc(schema.categories.name))
  } finally {
    await cleanup()
  }
})
