import { randomUUID } from 'uncrypto'
import { Job, JobStatus, ResourceJobType } from '~~/server/services/db'
import { getPhotoUploadUrl } from '~~/server/services/s3'
import { imageOriginalKey, imageLargeKey, imageThumbKey } from '#shared/constants'
import { uploadRequestSchema } from './_utils'

export default defineWrappedResponseHandler(async (event) => {
    const { mimeType, originalFilename } = await readValidatedBody(event, uploadRequestSchema.parse)

    const photoId = randomUUID()
    const originalKey = imageOriginalKey(photoId)
    // Large format is unknown at upload time; processor decides. Store without extension,
    // the processor updates it. We default to 'jpg' here as a placeholder in the job payload.
    const largeKeyWebp = imageLargeKey(photoId, 'webp')
    const largeKeyJpg = imageLargeKey(photoId, 'jpg')
    const thumbKey = imageThumbKey(photoId)

    await Job.create({
        id: photoId,
        type: ResourceJobType.ProcessImage,
        status: JobStatus.Waiting,
        payload: {
            mimeType,
            originalFilename,
            originalKey,
            largeKeyWebp,
            largeKeyJpg,
            thumbKey,
        },
    }).go()

    const uploadUrl = await getPhotoUploadUrl(photoId, mimeType)

    return {
        jobId: photoId,
        uploadUrl,
    }
})
