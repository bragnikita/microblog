import { Resource } from "sst";
import { z } from "zod";
import { Image, ResourceJob, ResourceJobStatus, ResourceJobType } from "~/server/services/db";
import * as s3 from "~/server/services/s3";
import { CONTENT_MINIFIED_PREFIX } from "~/shared/constants";

export default defineWrappedResponseHandler(async (event) => {
    const { filename, type } = await readValidatedBody(event, z.object({
        filename: z.string().nonempty(),
        type: z.string().nonempty(),
    }).parse);
    const { key, url, s3Key } = await s3.getMicroblogContentUploadUrl(filename);
    await Image.create({
        key,
        resourceStatus: 'pending',
        preprocessingStatus: ResourceJobStatus.Waiting,        
    }).go()
    const originalUrl = Resource.main.url + '/' + s3Key
    const thumbnailUrl = Resource.main.url + '/' + CONTENT_MINIFIED_PREFIX + key
    return {
        jobId: key,
        id: key,
        download: {
            originalUrl,
            thumbnailUrl,
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