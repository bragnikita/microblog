import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { schema } from '~~/server/db'
import { useDb, micropostBodySchema } from './_utils'

export default defineWrappedResponseHandler(async (event) => {
  const id = z.uuid().parse(getRouterParam(event, 'id'))
  const { bodyText } = await readValidatedBody(event, micropostBodySchema.parse)
  const { db, cleanup } = await useDb()
  try {
    const [post] = await db
      .update(schema.contents)
      .set({
        bodyText,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.contents.id, id),
          eq(schema.contents.contentType, 'micropost'),
        ),
      )
      .returning({
        id: schema.contents.id,
        slug: schema.contents.slug,
        bodyText: schema.contents.bodyText,
        publishedAt: schema.contents.publishedAt,
        createdAt: schema.contents.createdAt,
        updatedAt: schema.contents.updatedAt,
      })

    if (!post) {
      throw createError({ statusCode: 404, statusMessage: 'Post not found' })
    }

    return post
  } finally {
    await cleanup()
  }
})
