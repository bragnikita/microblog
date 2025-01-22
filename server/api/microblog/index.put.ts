import { z } from "zod";
import { Counters, MicroPost } from "~/server/services/db";

const PostValidator = z.object({
    text: z.string().nonempty().optional(),
    images: z.array(z.object({
        thumbnailUrl: z.string().url(),
    })).optional(),
    video: z.object({
        youtubeId: z.string().nonempty(),
    }).optional(),
}
).refine(data => data.text || data.images || data.video, { message: 'At least one of text, images or video must be provided' });

export default defineEventHandler(async (event) => {
    const { id } = await getValidatedRouterParams(event, z.object({ id: z.coerce.number() }).parse);
    const body = await readValidatedBody(event, PostValidator.parse);
    const original = await MicroPost.query.gs1({ id }).go();
    if (!original.data.length) {
        throw new Error(`Post ${id} not found`);
    }
    const post = await MicroPost.update({ timestamp: original.data[0].timestamp }).set({
        id,
        text: body.text,
        images: body.images,
        video: body.video,
    }).go();

    return {
        item: post,
    };
});