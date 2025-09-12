import { CONTENT_MINIFIED_PREFIX, CONTENT_ORIGINAL_PREFIX } from '../../shared/constants';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { z as zod } from 'zod';
import { Image, ResourceJobStatus } from '../services/db';


const s3EventValidator = zod.object({
    Records: zod.array(
        zod.object({
            eventSource: zod.literal('aws:s3'),
            eventName: zod.string(),
            s3: zod.object({
                configurationId: zod.string(),
                bucket: zod.object({
                    name: zod.string(),
                    arn: zod.string(),
                }),
                object: zod.object({
                    key: zod.string(),
                    size: zod.number(),
                }),
            }),
        })
    ),
});

const s3Client = new S3Client({ region: 'ap-northeast-1' });

export const handler = async (event: unknown) => {
    const { data, error } = s3EventValidator.safeParse(event)
    if (error) {
        console.error('Could not process an event', error)
        return;
    }
    for (const record of data.Records) {
        const decodedKey = decodeURIComponent(record.s3.object.key)
        console.log(`Processing event ${record.eventName} for ${record.s3.bucket.name}/${decodedKey}`)
        if (record.eventName.startsWith('ObjectCreated:')) {
            try {
                await processCreateResourceEvent(record.s3.bucket.name, decodedKey)
            } catch (e) {
                console.error(`Processing failure for image [${decodedKey}]:`, e)
            }
        }
    }
}

function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
const escapedPrefix = escapeRegExp(CONTENT_ORIGINAL_PREFIX)
const regex = new RegExp(`^${escapedPrefix}`)

async function processCreateResourceEvent(sourceBucket: string, bucketKey: string) {
    const key = bucketKey.replace(regex, '')
    console.log(`Processing image ${key}`);
    const imageJob = await Image.get({ key }).go();
    if (imageJob.data) {
        if (imageJob.data.resourceStatus === 'uploaded') {
            console.log(`Skipping already processed image ${key}`);
            return;
        }
    }
    try {
        await Image.upsert({ key }).set({ preprocessingStatus: ResourceJobStatus.Processing, resourceStatus: 'uploaded' }).go();
        await compressAndUpload(sourceBucket, bucketKey, key);
        await Image.update({ key }).set({ preprocessingStatus: ResourceJobStatus.Completed }).go();
    } catch (e) {
        console.error(`Could not process image ${key}`, e);
        await Image.upsert({ key }).set({ preprocessingStatus: ResourceJobStatus.Failed, resourceStatus: 'uploaded' }).go();
    }

}

async function isFileExists(bucket: string, key: string) {
    try {
        await s3Client.send(new GetObjectCommand({
            Bucket: bucket,
            Key: key,
        }));
        return true;
    } catch (e) {
        return false;
    }
}

async function compressAndUpload(sourceBucket: string, originalKey: string, key: string) {
    const minifiedPath = `${CONTENT_MINIFIED_PREFIX}${key}`;
    const minifiedExists = await isFileExists(sourceBucket, minifiedPath);
    if (minifiedExists) {
        throw new Error(`Minified image already exists for ${key}`);
    }

    const { default: sharp } = await import('sharp');

    const originalImage = await s3Client.send(new GetObjectCommand({
        Bucket: sourceBucket,
        Key: originalKey
    }));
    if (!originalImage.Body) {
        throw new Error(`Could not read image ${key}`);
    }
    const originalImageBytes = await originalImage.Body.transformToByteArray();
    const sharpImage = sharp(originalImageBytes);

    const { width, height, size, orientation } = await sharpImage.metadata();
    if (!width || !height || !size) { throw new Error('Could not read image metadata'); }

    const evaluationResult = shoudBeCompressed({ width, height, size });
    if (evaluationResult) {
        const resizedImage = await sharpImage.keepExif()
        .resize({fit: 'inside'}, IMAGE_COMPRESSION_SIDE_THRESHOLD).toFormat('jpeg').jpeg({ quality: 60, force: true })
        .toBuffer();

        await s3Client.send(new PutObjectCommand({
            Bucket: sourceBucket,
            Key: minifiedPath,
            Body: resizedImage,
            ContentType: 'image/jpeg',
        }))
    } else {
        await s3Client.send(new PutObjectCommand({
            Bucket: sourceBucket,
            Key: minifiedPath,
            Body: originalImageBytes,
            ContentType: originalImage.ContentType,
        }))
    }

}

const IMAGE_COMPRESSION_SIDE_THRESHOLD = 512; // px
const IMAGE_COMPRESSION_SIZE_THRESHOLD = 768 * 1024; // bytes, 768kB

type ImageMeta = {
    width: number;
    height: number;
    size: number;
};

function shoudBeCompressed({ width, height, size }: ImageMeta) {
    if (
        width > IMAGE_COMPRESSION_SIDE_THRESHOLD ||
        height > IMAGE_COMPRESSION_SIDE_THRESHOLD ||
        size > IMAGE_COMPRESSION_SIZE_THRESHOLD
    ) {
        return true
        // if (width >= height) {
        //     return {
        //         width: IMAGE_COMPRESSION_SIDE_THRESHOLD,
        //         height: Math.ceil(IMAGE_COMPRESSION_SIDE_THRESHOLD / (width / height)),
        //     };
        // } else {
        //     return {
        //         width: Math.ceil(IMAGE_COMPRESSION_SIDE_THRESHOLD / (height / width)),
        //         height: IMAGE_COMPRESSION_SIDE_THRESHOLD,
        //     };
        // }
    }

    return false;
}