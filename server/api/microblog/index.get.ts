import {MicroPost} from "~/server/services/db";

export default defineEventHandler(async (event) => {
    const list = await MicroPost.query.primary({}).go({ ignoreOwnership: true })
    return {
        list: list.data,
        cursor: list.cursor
    }
})