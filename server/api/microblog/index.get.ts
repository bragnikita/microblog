import { desc, eq, and, inArray, asc } from 'drizzle-orm'
import { schema } from '~~/server/db'
import { ImageResources } from '~~/server/services/s3'
import { useDb } from './_utils'

export default defineWrappedResponseHandler(async () => {
  const { db, cleanup } = await useDb()
  try {
    const posts = await db
      .select({
        id: schema.contents.id,
        slug: schema.contents.slug,
        bodyText: schema.contents.bodyText,
        publishedAt: schema.contents.publishedAt,
        createdAt: schema.contents.createdAt,
        updatedAt: schema.contents.updatedAt,
      })
      .from(schema.contents)
      .where(
        and(
          eq(schema.contents.contentType, 'micropost'),
          eq(schema.contents.visibility, 'public'),
          eq(schema.contents.status, 'published'),
        ),
      )
      .orderBy(desc(schema.contents.publishedAt))

    if (posts.length === 0) return []

    const postIds = posts.map(p => p.id)
    const attachments = await db
      .select({
        contentId: schema.contentPhotos.contentId,
        photoId: schema.contentPhotos.photoId,
        sortOrder: schema.contentPhotos.sortOrder,
      })
      .from(schema.contentPhotos)
      .where(
        and(
          inArray(schema.contentPhotos.contentId, postIds),
          eq(schema.contentPhotos.relationRole, 'attachment'),
        ),
      )
      .orderBy(asc(schema.contentPhotos.sortOrder))

    const imagesByPost = new Map<string, { id: string; thumbnailUrl: string; compressedUrl: string }[]>()
    for (const a of attachments) {
      const list = imagesByPost.get(a.contentId) ?? []
      list.push({ id: a.photoId, thumbnailUrl: ImageResources.thumbnail(a.photoId), compressedUrl: ImageResources.large(a.photoId, 'webp') })
      imagesByPost.set(a.contentId, list)
    }

    return posts.map(p => ({
      ...p,
      images: imagesByPost.get(p.id) ?? [],
    }))
  } finally {
    await cleanup()
  }
})
