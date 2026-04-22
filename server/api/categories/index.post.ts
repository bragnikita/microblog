import { eq } from 'drizzle-orm'
import { schema } from '~~/server/db'
import { useDb, categoryBodySchema } from './_utils'

export default defineWrappedResponseHandler(async (event) => {
  const body = await readValidatedBody(event, categoryBodySchema.parse)
  const { db, cleanup } = await useDb()
  try {
    if (body.parentCategoryId) {
      const [parent] = await db
        .select({ id: schema.categories.id })
        .from(schema.categories)
        .where(eq(schema.categories.id, body.parentCategoryId))
        .limit(1)
      if (!parent) {
        throw createError({ statusCode: 422, statusMessage: 'Parent category not found' })
      }
    }

    const [category] = await db
      .insert(schema.categories)
      .values({
        slug: body.slug,
        name: body.name,
        descriptionText: body.descriptionText ?? null,
        parentCategoryId: body.parentCategoryId ?? null,
        sortOrder: body.sortOrder,
        visibility: body.visibility,
      })
      .returning()

    return category
  } finally {
    await cleanup()
  }
})
