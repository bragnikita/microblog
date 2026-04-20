import { desc, eq, and } from 'drizzle-orm'
import { schema } from '~~/server/db'
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

    return posts
  } finally {
    await cleanup()
  }
})
