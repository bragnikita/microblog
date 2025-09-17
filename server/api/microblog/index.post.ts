import _ from "lodash";
import { DateTime } from "luxon";
import { z } from "zod";
import { Counters, MicroPost } from "~~/server/services/db";
import { defineWrappedResponseHandler } from "~~/server/utils/error-handler";
// import { formatToUTC } from "../../utils/dateTimeFormatter"


const PostValidator = z.object({
    text: z.string().optional().default(''),
    title: z.string().optional(),
    images: z.array(z.object({
        key: z.string().nonempty(),
    })).optional(),
    video: z.object({
        youtubeId: z.string().nonempty(),
    }).optional(),
}
).refine(data => data.text || (data.images && data.images.length > 0) || data.video, { message: 'At least one of text, images or video must be provided' });

export default defineWrappedResponseHandler(async (event) => {
    const body = PostValidator.parse(await readBody(event))
    const { data: nextCounters } = await Counters.update({}).add({ microposts: 1 }).go({ response: "all_new" });
    const post = await MicroPost.create({
        id: _.padStart(`${nextCounters.microposts!}`, 5, '0'),
        timestamp: DateTime.utc().toISO({suppressMilliseconds: true}),
        text: body.text,
        title: body.title,
        images: body.images,
        video: body.video,
    }).go();

    return {
        item: post.data,
    };
});