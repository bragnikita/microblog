import { Resource } from "sst";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DateTime } from "luxon";
import { CONTENT_MINIFIED_PREFIX, CONTENT_ORIGINAL_PREFIX } from "#shared/constants";

function randomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

const s3 = new S3Client();

export async function getMicroblogContentUploadUrl(originalFileName: string) {
    const key = `${DateTime.utc().toISO({ suppressMilliseconds: true }).replaceAll(/[ZT\:\.\-]/g, '')}-${randomString(8)}`;
    const s3Key = `${CONTENT_ORIGINAL_PREFIX}${key}`
    const params = new PutObjectCommand({
        Bucket: Resource.content.name,
        Key: s3Key,
        // Expires: DateTime.now().plus({ minutes: 5 }).toJSDate(),
    })
    return {key, s3Key , url: await getSignedUrl(s3, params)}
}

export const ImageResources = {
    original(key: string) {
        const base = new URL(Resource.main.url)
        base.pathname = `${CONTENT_ORIGINAL_PREFIX}${key}`.replaceAll(/\/{2,}/g,'/')
        return base.toString()
    },
    thumbnail(key: string) {
        const base = new URL(Resource.main.url)
        base.pathname = `${CONTENT_MINIFIED_PREFIX}${key}`.replaceAll(/\/{2,}/g,'/')
        return base.toString()
    }
}