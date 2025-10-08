import z from "zod";
import { MicroPost } from "~~/server/services/db";
import { MicroPostMapper } from "~~/server/services/mappers/microposts";

export default defineEventHandler<{ query: { } }>(async (event) => {
    const query = await getValidatedQuery(event, z.object({
        before: z.string().optional(),
        drafts: z.string().optional().default('false').transform(v => v === 'true')
    }).parse);
    console.log("Query:", query, event.toString());
    const queryOptions: any = { ignoreOwnership: true, order: 'desc', limit: 10 }
    const list = await MicroPost.query.gsi1({ visibility: query.drafts ? 'draft' : 'private' }).go(queryOptions)
    const mapper = new MicroPostMapper();
    await mapper.loadDependencies();
    return {
        list: list.data.map(mapper.mapPrivateMicroPost),
        cursor: list.cursor
    };
});