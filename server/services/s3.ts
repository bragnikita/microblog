import { Resource } from "sst";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DateTime } from "luxon";

const s3 = new S3Client();

export async function getMicroblogContentUploadUrl(originalFileName: string) {
    const key = `content/${DateTime.utc().toISO({ suppressMilliseconds: true })}-${originalFileName}`;
    const params = new PutObjectCommand({
        Bucket: Resource.content.name,
        Key: key,
        // Expires: DateTime.now().plus({ minutes: 5 }).toJSDate(),
    })
    return {key, url: await getSignedUrl(s3, params)}
}
