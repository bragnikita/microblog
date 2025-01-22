import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Context } from 'aws-lambda';
import { z as zod } from 'zod';
import { Sharp } from 'sharp';
import { Resource } from 'sst';


const s3EventValidator = zod.object({
    Records: zod.array(
        zod.object({
            eventSource: zod.literal('aws:s3'),
            eventName: zod.string(),
            s3: zod.object({
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

export const handler = async (event: unknown, ctx: Context) => {
    console.log('Before!')
    await s3Client.send(new PutObjectCommand({
        Bucket: Resource.content.name,
        Key: 'content/original/text.txt',   
        Body: 'Hello World!',     
    }))
    await s3Client.send(new GetObjectCommand({
        Bucket: Resource.content.name,
        Key: 'content/original/text.txt',   
    }))

    return 
    // console.log(event)
    // const { data, error } = s3EventValidator.safeParse(event)
    // if (error) {
    //     console.error('Could not process an event', error)
    //     return;
    // }
    // for (const record of data.Records) {
    //     console.log(`Processing event ${record.eventName} for ${record.s3.bucket.name}/${record.s3.object.key}`)
    //     if (record.eventName.startsWith('ObjectCreated:')) {
    //         try {
    //             await processCreateResourceEvent(record.s3.bucket.name, record.s3.object.key)
    //         } catch (e) {
    //             console.error(`Could not process [${record.s3.object.key}]:`, e)
    //         }
    //     }
    // }

}

async function processCreateResourceEvent(sourceBucket: string, key: string) {
    const minifiedPath = key.replace(/^content\/original/, 'contents/minified');
    const minifiedExists = await s3Client.send(new GetObjectCommand({
        Bucket: sourceBucket,
        Key: minifiedPath,
    })).then(() => true).catch(() => false);
    if (minifiedExists) {
        throw new Error(`Minified image already exists for ${key}`);
    }

    const { default: sharp } = await import('sharp');

    const originalImage = await s3Client.send(new GetObjectCommand({
        Bucket: sourceBucket,
        Key: key
    }));
    if (!originalImage.Body) {
        throw new Error(`Could not read image ${key}`);
    }
    const originalImageBytes = await originalImage.Body.transformToByteArray();
    const sharpImage = sharp(originalImageBytes);

    const { width, height, size } = await sharpImage.metadata();
    if (!width || !height || !size) { throw new Error('Could not read image metadata'); }

    const evaluationResult = evaluateImageMeta({ width, height, size });
    if (evaluationResult) {
        const resizedImage = await sharpImage.resize(200, 200).toFormat('jpeg').jpeg({ quality: 60, force: true }).toBuffer();

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

function evaluateImageMeta({ width, height, size }: ImageMeta): Omit<ImageMeta, 'size'> | undefined {
    if (
        width > IMAGE_COMPRESSION_SIDE_THRESHOLD ||
        height > IMAGE_COMPRESSION_SIDE_THRESHOLD ||
        size > IMAGE_COMPRESSION_SIZE_THRESHOLD
    ) {
        if (width >= height) {
            return {
                width: IMAGE_COMPRESSION_SIDE_THRESHOLD,
                height: Math.ceil(IMAGE_COMPRESSION_SIDE_THRESHOLD / (width / height)),
            };
        } else {
            return {
                width: Math.ceil(IMAGE_COMPRESSION_SIDE_THRESHOLD / (height / width)),
                height: IMAGE_COMPRESSION_SIDE_THRESHOLD,
            };
        }
    }

    return undefined;
}