import { schema } from '~~/server/db'
import { useDb, micropostCreateSchema, generateSlug } from './_utils'

export default defineWrappedResponseHandler(async (event) => {
  const { content, images } = await readValidatedBody(event, micropostCreateSchema.parse)
  const { db, cleanup } = await useDb()
  try {
    const now = new Date()
    const [post] = await db
      .insert(schema.contents)
      .values({
        contentType: 'micropost',
        bodyFormat: 'text',
        visibility: 'public',
        status: 'published',
        slug: generateSlug(),
        bodyText: content,
        publishedAt: now,
      })
      .returning({
        id: schema.contents.id,
        slug: schema.contents.slug,
        bodyText: schema.contents.bodyText,
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
