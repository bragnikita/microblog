import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { schema } from '~~/server/db'
import { useDb, categoryBodySchema } from './_utils'

export default defineWrappedResponseHandler(async (event) => {
  const id = z.string().uuid().parse(getRouterParam(event, 'id'))
  const body = await readValidatedBody(event, categoryBodySchema.parse)
  const { db, cleanup } = await useDb()
  try {
    if (body.parentCategoryId === id) {
      throw createError({ statusCode: 422, statusMessage: 'A category cannot be its own parent' })
    }

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
      .update(schema.categories)
      .set({
        slug: body.slug,
        name: body.name,
        descriptionText: body.descriptionText ?? null,
        parentCategoryId: body.parentCategoryId ?? null,
        sortOrder: body.sortOrder,
        visibility: body.visibility,
        updatedAt: new Date(),
      })
      .where(eq(schema.categories.id, id))
      .returning()

    if (!category) {
      throw createError({ statusCode: 404, statusMessage: 'Category not found' })
    }

    return category
  } finally {
    await cleanup()
  }
})
