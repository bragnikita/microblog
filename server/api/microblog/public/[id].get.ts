import { z } from "zod";
import { MicroPost } from "~~/server/services/db";
import { MicroPostMapper } from "~~/server/services/mappers/microposts";

export default defineEventHandler(async (event) => {
    const { id } = await getValidatedRouterParams(event, z.object({ id: z.string() }).parse);
    let post = await MicroPost.get({ id }).go();
    if (!post?.data) {
        throw new Error(`Post id=${id} not found`);
    }
    const mapper = new MicroPostMapper();
    await mapper.loadDependencies();
    return mapper.mapPrivateMicroPost(post.data);
})