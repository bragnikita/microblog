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
    // Create a new S3 object with a unique key
    // and return a pre-signed URL for uploading
    // Also create a DB record with status 'pending'
    // The key can be used as the job ID to track the processing status
    // The client can poll another endpoint to check the status
    // Once the processing is done, the status will be updated to 'completed'
    // and the URLs for original and thumbnail images will be available
    // The client can then use these URLs to display the images
    // or download them as needed
    // For simplicity, we assume the processing is done instantly here
    // In a real-world scenario, this would be handled by a background job
    // that listens to S3 events and processes the images accordingly
    // e.g. using AWS Lambda or a similar service
    // The processing job would update the DB record with the new status
    // and the URLs for the processed images
    // Here we just return the pre-signed URL and the job ID
    // The client can use this information to upload the image
    // and track the processing status
    // Note: Ensure that the S3 bucket has the appropriate CORS configuration
    // to allow uploads from the client application
    // Also, make sure to handle errors and edge cases in a real implementation
    // such as invalid file types, upload failures, etc.
    // This is a simplified example for demonstration purposes only     
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
};