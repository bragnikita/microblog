import { schema } from '~~/server/db'
import { useDb, micropostCreateSchema, generateSlug } from './_utils'

export default defineWrappedResponseHandler(async (event) => {
  const { content, images, visibility, status } = await readValidatedBody(event, micropostCreateSchema.parse)
  const { db, cleanup } = await useDb()
  try {
    const publishedAt = status === 'published' ? new Date() : null
    const [post] = await db
      .insert(schema.contents)
      .values({
        contentType: 'micropost',
        bodyFormat: 'text',
        visibility,
        status,
        slug: generateSlug(),
        bodyText: content,
        publishedAt,
      })
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
      throw createError({ statusCode: 500, statusMessage: 'Failed to create post' })
    }

    if (images.length > 0) {
      await db.insert(schema.contentPhotos).values(
        images.map((photoId, idx) => ({
          contentId: post.id,
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
