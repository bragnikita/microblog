import { schema } from '~~/server/db'
import { useDb, micropostBodySchema, generateSlug } from './_utils'

export default defineWrappedResponseHandler(async (event) => {
  const { bodyText } = await readValidatedBody(event, micropostBodySchema.parse)
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
        bodyText,
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

    return post
  } finally {
    await cleanup()
  }
})
