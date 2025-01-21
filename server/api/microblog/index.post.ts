import {Counters, MicroPost} from "~/server/storage/db";
import {DateTime} from "luxon";

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { data: nextCounters } = await Counters.update({ }).add({ microposts: 1 }).go({ response: "all_new"})
    const post = await MicroPost.create({
        id: nextCounters.microposts!,
        timestamp: DateTime.now().toUTC().toISO({ suppressMilliseconds: true }),
        text: body.text,
        images: [],
    }).go()

    return {
        item: post,
    }
})