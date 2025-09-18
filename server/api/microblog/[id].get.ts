import { z } from "zod";
import { MicroPost } from "~~/server/services/db";
import { ImageResources } from "~~/server/services/s3";

export default defineEventHandler(async (event) => {
    const { id } = await getValidatedRouterParams(event, z.object({ id: z.string() }).parse);
    const { data } = await MicroPost.query.gsi1({ id }).go();
    if (!data.length) {
        throw new Error(`Post id=${id} not found`);
    }
    const item = data.map(v => {
        return {
            ...v,
            images: v.images?.map(image => ({
                key: image.key,
                thumbnailUrl: ImageResources.thumbnail(image.key),
                originalUrl: ImageResources.original(image.key)
            })) || []
        }
    })[0]
    return item;
})