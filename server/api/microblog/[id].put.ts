import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { schema } from '~~/server/db'
import { useDb, micropostUpdateSchema } from './_utils'

export default defineWrappedResponseHandler(async (event) => {
  const id = z.string().uuid().parse(getRouterParam(event, 'id'))
  const { content, images, visibility, status } = await readValidatedBody(event, micropostUpdateSchema.parse)
  const { db, cleanup } = await useDb()
  try {
    const publishedAt = status === 'published' ? new Date() : null
    const [post] = await db
      .update(schema.contents)
      .set({
        bodyText: content,
        visibility,
        status,
        publishedAt,
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
        visibility: schema.contents.visibility,
        status: schema.contents.status,
        publishedAt: schema.contents.publishedAt,
        createdAt: schema.contents.createdAt,
        updatedAt: schema.contents.updatedAt,
      })

    if (!post) {
      throw createError({ statusCode: 404, statusMessage: 'Post not found' })
    }

    await db
      .delete(schema.contentPhotos)
      .where(
        and(
          eq(schema.contentPhotos.contentId, id),
          eq(schema.contentPhotos.relationRole, 'attachment'),
        ),
      )

    if (images.length > 0) {
      await db.insert(schema.contentPhotos).values(
        images.map((photoId, idx) => ({
          contentId: id,
          photoId,
          relationRole: 'attachment',
          sortOrder: idx,
        })),
      )
    }

    return post
  } finally {
    await cleanup()
  }
})
