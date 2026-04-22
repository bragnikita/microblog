import { Resource } from "sst";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { imageOriginalKey, imageLargeKey, imageThumbKey } from "#shared/constants";

const s3 = new S3Client();

export async function getPhotoUploadUrl(photoId: string, mimeType: string): Promise<string> {
    const s3Key = imageOriginalKey(photoId)
    const params = new PutObjectCommand({
        Bucket: Resource.content.name,
        Key: s3Key,
        ContentType: mimeType,
    })
    return getSignedUrl(s3, params, { expiresIn: 300 })
}

export async function deletePhotoFiles(photoId: string): Promise<void> {
    const keys = [
        imageOriginalKey(photoId),
        imageThumbKey(photoId),
        imageLargeKey(photoId, 'webp'),
        imageLargeKey(photoId, 'jpg'),
    ]
    await s3.send(new DeleteObjectsCommand({
        Bucket: Resource.content.name,
        Delete: {
            Objects: keys.map((Key) => ({ Key })),
            Quiet: true,
        },
    }))
}

export const ImageResources = {
    original(photoId: string): string {
        const base = new URL(Resource.main.url)
        base.pathname = `/${imageOriginalKey(photoId)}`
        return base.toString()
    },
    thumbnail(photoId: string): string {
        const base = new URL(Resource.main.url)
        base.pathname = `/${imageThumbKey(photoId)}`
        return base.toString()
    },
    large(photoId: string, format: string): string {
        const base = new URL(Resource.main.url)
        base.pathname = `/${imageLargeKey(photoId, format)}`
        return base.toString()
    },
}