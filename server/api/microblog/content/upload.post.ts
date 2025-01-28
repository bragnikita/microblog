import { z } from "zod";
import { Image, ResourceJobStatus } from "~/server/services/db";
import * as s3 from "~/server/services/s3";

export default defineWrappedResponseHandler(async (event) => {
    const { filename, type } = await readValidatedBody(event, z.object({
        filename: z.string().nonempty(),
        type: z.string().nonempty(),
    }).parse);
    const { key, url } = await s3.getMicroblogContentUploadUrl(filename);
    await Image.create({
        key,
        resourceStatus: 'pending',
        preprocessingStatus: ResourceJobStatus.Waiting,        
    }).go()
    const originalUrl = s3.ImageResources.original(key)
    const thumbnailUrl = s3.ImageResources.thumbnail(key)
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