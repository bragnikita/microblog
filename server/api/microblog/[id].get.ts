import { eq, and, asc } from 'drizzle-orm'
import { z } from 'zod'
import { schema } from '~~/server/db'
import { ImageResources } from '~~/server/services/s3'
import { useDb } from './_utils'

export default defineWrappedResponseHandler(async (event) => {
  const id = z.string().uuid().parse(getRouterParam(event, 'id'))
  const session = await getUserSession(event)
  const isLoggedIn = !!session?.user
  const { db, cleanup } = await useDb()
  try {
    const whereConditions = [
      eq(schema.contents.id, id),
      eq(schema.contents.contentType, 'micropost'),
    ]
    if (!isLoggedIn) {
      whereConditions.push(eq(schema.contents.visibility, 'public'))
      whereConditions.push(eq(schema.contents.status, 'published'))
    }

    const [post] = await db
      .select({
        id: schema.contents.id,
        slug: schema.contents.slug,
        bodyText: schema.contents.bodyText,
        visibility: schema.contents.visibility,
        status: schema.contents.status,
        publishedAt: schema.contents.publishedAt,
        createdAt: schema.contents.createdAt,
        updatedAt: schema.contents.updatedAt,
      })
      .from(schema.contents)
      .where(and(...whereConditions))
      .limit(1)

    if (!post) {
      throw createError({ statusCode: 404, statusMessage: 'Post not found' })
    }

    const attachments = await db
      .select({
        photoId: schema.contentPhotos.photoId,
        sortOrder: schema.contentPhotos.sortOrder,
      })
      .from(schema.contentPhotos)
      .where(
        and(
          eq(schema.contentPhotos.contentId, id),
          eq(schema.contentPhotos.relationRole, 'attachment'),
        ),
      )
      .orderBy(asc(schema.contentPhotos.sortOrder))

    return {
      ...post,
      images: attachments.map(a => ({
        id: a.photoId,
        thumbnailUrl: ImageResources.thumbnail(a.photoId),
        compressedUrl: ImageResources.large(a.photoId, 'webp'),
      })),
    }
  } finally {
    await cleanup()
  }
})
