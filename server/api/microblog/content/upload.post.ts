import { Resource } from "sst";
import { z } from "zod";
import * as s3 from "~/server/services/s3";

export default defineWrappedResponseHandler(async (event) => {
    const { filename, type } = await readValidatedBody(event, z.object({
        filename: z.string().nonempty(),
        type: z.string().nonempty(),
    }).parse);
    const { key, url } = await s3.getMicroblogContentUploadUrl(filename);
    // TODO create resource compression job
    const originalUrl = Resource.main.url + '/' + key
    return {
        jobId: key,
        id: key,
        download: {
            originalUrl,
            thumbnailUrl: originalUrl,
        },
        upload: {
            url,
            method: 'PUT',
            headers: {
                'Content-Type': type,
            }
        }
    }
});