import { z } from "zod";
import { MicroPost } from "~/server/services/db";

export default defineWrappedResponseHandler(async (event) => {
    const { id } = await getValidatedRouterParams(event, z.object({ id: z.coerce.number() }).parse);
    const { data } = await MicroPost.query.gsi1({ id }).go();
    if (!data.length) {
        throw new Error(`Post id=${id} not found`);
    }
    // TODO delete images
    await MicroPost.delete({ timestamp: data[0].timestamp }).go();
});