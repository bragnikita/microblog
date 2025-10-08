import { DateTime } from "luxon";
import { z } from "zod";
import { MicroPost } from "~~/server/services/db";
import { defineWrappedResponseHandler } from "~~/server/utils/error-handler";
// import { formatToUTC } from "../../utils/dateTimeFormatter"


const PostValidator = z.object({
    text: z.string().optional().default(''),
    title: z.string().optional(),
    images: z.array(z.object({
        id: z.string().nonempty(),
    })).optional(),
    video: z.object({
        youtubeId: z.string().nonempty(),
    }).optional(),
    visibility: z.enum(['public', 'private', 'draft'] as const).default('private'),
}
).refine(data => data.text || (data.images && data.images.length > 0) || data.video, { message: 'At least one of text, images or video must be provided' });

export default defineWrappedResponseHandler(async (event) => {
    const body = PostValidator.parse(await readBody(event))
    const id = generateStringId();
    const now = DateTime.utc().toISO({suppressMilliseconds: true});
    const post = await MicroPost.create({
        id,
        visibility: body.visibility,
        publishedAt: now,
        content: {
            text: body.text,
            title: body.title,
            images: body.images || [],
            video: body.video,
            links: [],
        },
        tags: []
    }).go();

    return {
        item: post.data,
    };
});

function generateStringId(): string {
    const now = DateTime.utc().toFormat("yyyyLLddHHmmss");
    const random = Math.random().toString(36).slice(2, 7);
    return `${now}_${random}`;
}