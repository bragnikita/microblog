import { MicroPost } from "~/server/services/db";
import { ImageResources } from "~/server/services/s3";

export default defineEventHandler(async (event) => {
    const list = await MicroPost.query.primary({}).go({ ignoreOwnership: true, order: 'desc' })
    return {
        list: list.data.map(v => {
            return {
                ...v,
                images: v.images?.map(image => ({
                    key: image.key,
                    thumbnailUrl: ImageResources.thumbnail(image.key),
                    originalUrl: ImageResources.original(image.key)
                }))
            }
        }),
        cursor: list.cursor
    }
})