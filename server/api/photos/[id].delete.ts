import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { schema } from '~~/server/db'
import { deletePhotoFiles } from '~~/server/services/s3'
import { useDb } from './_utils'

export default defineWrappedResponseHandler(async (event) => {
  const id = z.string().uuid().parse(getRouterParam(event, 'id'))
  const { db, cleanup } = await useDb()
  try {
    // Find contents related via content_photos join table
    const linkedViaJoin = await db
      .select({
        contentId: schema.contentPhotos.contentId,
        slug: schema.contents.slug,
      })
      .from(schema.contentPhotos)
      .innerJoin(schema.contents, eq(schema.contents.id, schema.contentPhotos.contentId))
      .where(eq(schema.contentPhotos.photoId, id))

    // Find contents that use this photo as cover
    const linkedAsCover = await db
      .select({
        contentId: schema.contents.id,
        slug: schema.contents.slug,
      })
      .from(schema.contents)
      .where(eq(schema.contents.coverPhotoId, id))

    // Merge, deduplicate by contentId
    const seen = new Set<string>()
    const relations: { contentId: string; slug: string | null }[] = []
    for (const row of [...linkedViaJoin, ...linkedAsCover]) {
      if (!seen.has(row.contentId)) {
        seen.add(row.contentId)
        relations.push({ contentId: row.contentId, slug: row.slug ?? null })
      }
    }

    if (relations.length > 0) {
      setResponseStatus(event, 409)
      return {
        message: 'Photo is referenced by existing content and cannot be deleted',
        relations,
      }
    }

    const [deleted] = await db
      .delete(schema.photos)
      .where(eq(schema.photos.id, id))
      .returning({ id: schema.photos.id })

    if (!deleted) {
      throw createError({ statusCode: 404, statusMessage: 'Photo not found' })
    }

    await deletePhotoFiles(id)

    return { ok: true }
  } finally {
    await cleanup()
  }
})
