import { z } from "zod";
import { Image, ResourceJobStatus } from "../../../services/db";
import * as s3 from "../../../services/s3"

export default defineWrappedResponseHandler(async (event) => {
    const tasks = await readValidatedBody(event, z.array(z.object({
        filename: z.string().nonempty(),
        type: z.string().nonempty(),
    })).parse);
    return await Promise.all(tasks.map(task => createUploadUrl(task.filename,task.type )))
});

const createUploadUrl = async (filename: string, type: string) => {   
    const { key, url } = await s3.getMicroblogContentUploadUrl(filename);
    await Image.create({
        key,
        resourceStatus: 'pending',
        preprocessingStatus: ResourceJobStatus.Waiting,        
    }).go()
    const originalUrl = s3.ImageResources.original(key)
    const thumbnailUrl = s3.ImageResources.thumbnail(key)
    const compressedUrl = s3.ImageResources.compressed(key)
    return {
        jobId: key,
        id: key,
        download: {
            originalUrl,
            compressedUrl,
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
};