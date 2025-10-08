import { DateTime } from "luxon";
import { MicroPost } from "~~/server/services/db";
import { PostIdValidator, PostValidator } from "~~/server/services/validators";

export default defineEventHandler(async (event) => {
    const { id } = await getValidatedRouterParams(event, PostIdValidator.parse);
    const body = await readValidatedBody(event, PostValidator.parse);
    const original = await MicroPost.get({ id }).go();
    if (!original.data) {
        throw new Error(`Post ${id} not found`);
    }
    let publishedAt: string | undefined;
    if (original.data.visibility === 'draft' || original.data.visibility === 'private' && body.visibility === 'public') {
        publishedAt = DateTime.utc().toISO({ suppressMilliseconds: true });
    }
    const post = await MicroPost.update({ id }).set({
        content: {
            text: body.text,
            title: body.title,
            images: body.images,
            video: body.video,
        },
        visibility: body.visibility,
        publishedAt
    }).go({ response: 'all_new' });

    return post;
});