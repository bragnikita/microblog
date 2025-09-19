import { MicroPost } from "~~/server/services/db";
import { ImageResources } from "~~/server/services/s3";

export default defineEventHandler<{ query: { before?: string } }>(async (event) => {
    const { before } = getQuery(event);
    const queryOptions: any = { ignoreOwnership: true, order: 'desc', limit: 10 }
    let list
    if (before) {
        list = await MicroPost.query.primary({}).lt({ timestamp: before }).go(queryOptions)
    } else {
        list = await MicroPost.query.primary({}).go(queryOptions)
    }

    return {
        list: list.data.map(v => {
            return {
                ...v,
                images: v.images?.map(image => ({
                    key: image.key,
                    thumbnailUrl: ImageResources.thumbnail(image.key),
                    compressedUrl: ImageResources.compressed(image.key),
                    originalUrl: ImageResources.original(image.key)
                }))
            }
        }),
        cursor: list.cursor
    };
});