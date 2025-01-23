import { Resource } from "sst";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DateTime } from "luxon";
import { CONTENT_ORIGINAL_PREFIX } from "~/shared/constants";

const s3 = new S3Client();

export async function getMicroblogContentUploadUrl(originalFileName: string) {
    const key = `${DateTime.utc().toISO({ suppressMilliseconds: true })}-${originalFileName}`;
    const s3Key = `${CONTENT_ORIGINAL_PREFIX}${key}`
    const params = new PutObjectCommand({
        Bucket: Resource.content.name,
        Key: s3Key,
        // Expires: DateTime.now().plus({ minutes: 5 }).toJSDate(),
    })
    return {key, s3Key , url: await getSignedUrl(s3, params)}
}
