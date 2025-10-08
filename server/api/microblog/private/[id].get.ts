import { z } from "zod";
import { MicroPost } from "~~/server/services/db";
import { MicroPostMapper } from "~~/server/services/mappers/microposts";

export default defineEventHandler(async (event) => {
    const { id } = await getValidatedRouterParams(event, z.object({ id: z.string() }).parse);
    const { data } = await MicroPost.query.primary({ id }).go();
    if (!data.length) {
        throw new Error(`Post id=${id} not found`);
    }
    const mapper = new MicroPostMapper();
    await mapper.loadDependencies();
    return mapper.mapPrivateMicroPost(data[0]);
})