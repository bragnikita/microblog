import { MicroPost } from "~~/server/services/db";
import { MicroPostMapper } from "~~/server/services/mappers/microposts";

export default defineEventHandler<{ query: { } }>(async (event) => {    
    const queryOptions: any = { ignoreOwnership: true, order: 'desc', limit: 10 }
    const list = await MicroPost.query.gsi1({ visibility: 'private' }).go(queryOptions)
    const mapper = new MicroPostMapper();
    await mapper.loadDependencies();
    return {
        list: list.data.map(mapper.mapPrivateMicroPost),
        cursor: list.cursor
    };
});