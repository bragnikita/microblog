import { z } from "zod";
import { MicroPost } from "~~/server/services/db";
import { PostIdValidator } from "~~/server/services/validators";

export default defineWrappedResponseHandler(async (event) => {
    const { id } = await getValidatedRouterParams(event, PostIdValidator.parse);
    const { data } = await MicroPost.query.primary({ id }).go();
    if (!data.length) {
        throw new Error(`Post id=${id} not found`);
    }
    // TODO delete images
    await MicroPost.delete({ id }).go();
});