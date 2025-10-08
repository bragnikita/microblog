import { MicroPost } from "~~/server/services/db";
import { MicroPostMapper } from "~~/server/services/mappers/microposts";

export default defineEventHandler<{ query: { before?: string } }>(async (event) => {
    const { before } = getQuery(event);
    const queryOptions: any = { ignoreOwnership: true, order: 'desc', limit: 10 }
    let list
    if (before) {
        list = await MicroPost.query.gsi1({ visibility: 'public' }).lt({ publishedAt: before }).go(queryOptions)
    } else {
        list = await MicroPost.query.gsi1({ visibility: 'public' }).go(queryOptions)
    }

    const mapper = new MicroPostMapper();
    await mapper.loadDependencies();

    return {
        list: list.data.map(mapper.mapPublicMicroPost),
        cursor: list.cursor
    };
});