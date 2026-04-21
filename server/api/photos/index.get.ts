import { desc, eq, and, lt, or } from 'drizzle-orm'
import { schema } from '~~/server/db'
import { ImageResources } from '~~/server/services/s3'
import { useDb, photosListQuerySchema } from './_utils'

export default defineWrappedResponseHandler(async (event) => {
  const rawQuery = getQuery(event)
  const { limit, cursor } = photosListQuerySchema.parse(rawQuery)

  const { db, cleanup } = await useDb()
  try {
    let cursorPhoto: { createdAt: Date; id: string } | undefined

    if (cursor) {
      const [found] = await db
        .select({ createdAt: schema.photos.createdAt, id: schema.photos.id })
        .from(schema.photos)
        .where(eq(schema.photos.id, cursor))
        .limit(1)
      cursorPhoto = found
    }

    const conditions = cursorPhoto
      ? or(
          lt(schema.photos.createdAt, cursorPhoto.createdAt),
          and(
            eq(schema.photos.createdAt, cursorPhoto.createdAt),
            lt(schema.photos.id, cursorPhoto.id),
          ),
        )
      : undefined

    const rows = await db
      .select({
        id: schema.photos.id,
        createdAt: schema.photos.createdAt,
      })
      .from(schema.photos)
      .where(conditions)
      .orderBy(desc(schema.photos.createdAt), desc(schema.photos.id))
      .limit(limit + 1)

    const hasMore = rows.length > limit
    const items = (hasMore ? rows.slice(0, limit) : rows).map((row) => ({
      id: row.id,
      thumbnailUrl: ImageResources.thumbnail(row.id),
      compressedUrl: ImageResources.large(row.id, 'webp'),
      originalUrl: ImageResources.original(row.id),
      createdAt: row.createdAt,
    }))
    console.log(`Fetched ${items.length} photos${hasMore ? ' (more available)' : ''}`)
    return {
      items,
      nextCursor: hasMore ? rows[limit - 1]!.id : null,
    }
  } finally {
    await cleanup()
  }
})
