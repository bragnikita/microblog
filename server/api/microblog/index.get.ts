import { desc, eq, and, inArray, asc } from 'drizzle-orm'
import { z } from 'zod'
import { schema } from '~~/server/db'
import { ImageResources } from '~~/server/services/s3'
import { useDb } from './_utils'

const PAGE_SIZE = 3

export default defineWrappedResponseHandler(async (event) => {
  const session = await getUserSession(event)
  const isLoggedIn = !!session?.user
  const query = getQuery(event)
  const offset = z.coerce.number().int().min(0).default(0).parse(query.offset)
  const filterStatus = z.enum(['published', 'draft', 'archived']).optional().parse(query.status || undefined)
  const filterVisibility = z.enum(['public', 'private']).optional().parse(query.visibility || undefined)
  const { db, cleanup } = await useDb()
  try {
    const whereConditions = [eq(schema.contents.contentType, 'micropost')]
    if (!isLoggedIn) {
      whereConditions.push(eq(schema.contents.visibility, 'public'))
      whereConditions.push(eq(schema.contents.status, 'published'))
    } else {
      if (filterStatus) whereConditions.push(eq(schema.contents.status, filterStatus))
      if (filterVisibility) whereConditions.push(eq(schema.contents.visibility, filterVisibility))
    }

    const posts = await db
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
      .orderBy(desc(schema.contents.publishedAt))
      .limit(PAGE_SIZE)
      .offset(offset)

    if (posts.length === 0) return { posts: [], hasMore: false }

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

    return {
      posts: posts.map(p => ({
        ...p,
        images: imagesByPost.get(p.id) ?? [],
      })),
      hasMore: posts.length === PAGE_SIZE,
    }
  } finally {
    await cleanup()
  }
})
