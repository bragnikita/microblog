import { IMAGES_DROP_PREFIX, IMAGES_ORIGINALS_PREFIX, imageLargeKey, imageOriginalKey, imageThumbKey } from '../../shared/constants';
import { CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';
import { z as zod } from 'zod';
import { Job, JobStatus, ResourceJobType } from '../services/db';
import { useDb } from '../db/index';
import * as schema from '../db/schema';
import exifr from 'exifr';

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

const jobPayloadValidator = zod.object({
    mimeType: zod.string(),
    originalFilename: zod.string(),
    originalKey: zod.string(),
    largeKeyWebp: zod.string(),
    largeKeyJpg: zod.string(),
    thumbKey: zod.string(),
});

const s3Client = new S3Client({ region: 'ap-northeast-1' });

// Matches files/images/originals/{photoId}/original
const ORIGINAL_KEY_REGEX = new RegExp(`^${IMAGES_ORIGINALS_PREFIX}([^/]+)/original$`);

// Matches files/images/drop/{filename} (any depth under drop prefix)
const DROP_KEY_REGEX = new RegExp(`^${IMAGES_DROP_PREFIX}(.+)$`);

export const handler = async (event: unknown) => {
    const { data, error } = s3EventValidator.safeParse(event);
    if (error) {
        console.error('Could not process an event', error);
        return;
    }
    console.log(`Received ${data.Records.length} S3 event records: `, data.Records.map(r => r.s3.object.key));
    for (const record of data.Records) {
        const decodedKey = decodeURIComponent(record.s3.object.key);
        console.log(`Processing event ${record.eventName} for ${record.s3.bucket.name}/${decodedKey}`);
        if (record.eventName.startsWith('ObjectCreated:')) {
            try {
                if (DROP_KEY_REGEX.test(decodedKey)) {
                    await processDropUpload(record.s3.bucket.name, decodedKey);
                } else if (ORIGINAL_KEY_REGEX.test(decodedKey)) {
                    await processOriginalUpload(record.s3.bucket.name, decodedKey);
                } else {
                    console.log(`Key ${decodedKey} does not match any known pattern, skipping`);
                }
            } catch (e) {
                console.error(`Processing failure for key [${decodedKey}]:`, e);
            }
        }
    }
};

async function processDropUpload(bucket: string, dropKey: string) {
    const match = DROP_KEY_REGEX.exec(dropKey);
    if (!match || !match[1]) {
        console.log(`Drop key ${dropKey} did not match expected pattern, skipping`);
        return;
    }

    // Use just the basename as the original filename
    const droppedPath = match[1];
    const originalFilename = droppedPath.split('/').pop() ?? droppedPath;
    console.log(`Processing drop upload: ${originalFilename}`);

    // Get ContentType without downloading the body
    const headResult = await s3Client.send(new HeadObjectCommand({ Bucket: bucket, Key: dropKey }));
    const mimeType = headResult.ContentType ?? 'application/octet-stream';

    const photoId = randomUUID();
    const originalKey = imageOriginalKey(photoId);
    const largeKeyWebp = imageLargeKey(photoId, 'webp');
    const largeKeyJpg = imageLargeKey(photoId, 'jpg');
    const thumbKey = imageThumbKey(photoId);

    // Register processing job before moving the file
    await Job.create({
        id: photoId,
        status: JobStatus.Waiting,
        type: ResourceJobType.ProcessImage,
        createdAt: new Date().toISOString(),
        payload: {
            mimeType,
            originalFilename,
            originalKey,
            largeKeyWebp,
            largeKeyJpg,
            thumbKey,
        },
    }).go();
    console.log(`Created job ${photoId} for drop upload ${originalFilename}`);

    // Copy to the originals location — this triggers the processing branch
    await s3Client.send(new CopyObjectCommand({
        Bucket: bucket,
        CopySource: `${bucket}/${dropKey}`,
        Key: originalKey,
        ContentType: mimeType,
        MetadataDirective: 'REPLACE',
    }));

    // Delete the drop file
    await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: dropKey }));

    console.log(`Drop file ${dropKey} moved to ${originalKey}, processing job ${photoId} queued`);
}

async function processOriginalUpload(bucket: string, s3Key: string) {
    const match = ORIGINAL_KEY_REGEX.exec(s3Key);
    if (!match || !match[1]) {
        console.log(`Key ${s3Key} does not match expected original pattern, skipping`);
        return;
    }
    const photoId: string = match[1];
    console.log(`Processing photo ${photoId}`);

    const jobResult = await Job.get({ id: photoId }).go();
    if (!jobResult.data) {
        console.error(`No job found for photoId ${photoId}`);
        return;
    }
    const job = jobResult.data;
    if (job.type !== ResourceJobType.ProcessImage) {
        console.error(`Job ${photoId} is not a ProcessImage job`);
        return;
    }
    if (job.status === JobStatus.Completed) {
        console.log(`Job ${photoId} already completed, skipping`);
        return;
    }

    const payloadParse = jobPayloadValidator.safeParse(job.payload);
    if (!payloadParse.success) {
        console.error(`Invalid payload for job ${photoId}`, payloadParse.error);
        await Job.update({ id: photoId }).set({ status: JobStatus.Failed, statusMessage: 'Invalid job payload' }).go();
        return;
    }
    const payload = payloadParse.data;

    try {
        await Job.update({ id: photoId }).set({ status: JobStatus.Processing }).go();
        const { largeFormat, width, height, fileSizeBytes, latitude, longitude, takenAt } =
            await generateDerivatives(bucket, s3Key, photoId, payload);

        const largeKey = imageLargeKey(photoId, largeFormat);
        const thumbKey = imageThumbKey(photoId);

        const { db, cleanup } = await useDb();
        try {
            await db.insert(schema.photos).values({
                id: photoId,
                originalKey: payload.originalKey,
                largeKey,
                thumbKey,
                originalFilename: payload.originalFilename,
                mimeType: payload.mimeType,
                width,
                height,
                fileSizeBytes: fileSizeBytes ?? null,
                latitude: latitude !== undefined ? String(latitude) : null,
                longitude: longitude !== undefined ? String(longitude) : null,
                takenAt: takenAt ?? null,
            });
        } finally {
            await cleanup();
        }

        await Job.update({ id: photoId }).set({ status: JobStatus.Completed }).go();
        console.log(`Photo ${photoId} processed successfully`);
    } catch (e) {
        console.error(`Failed to process photo ${photoId}:`, e);
        await Job.update({ id: photoId }).set({
            status: JobStatus.Failed,
            statusMessage: e instanceof Error ? e.message : String(e),
        }).go();
    }
}

const THUMB_MAX_SIDE = 512;
const LARGE_MAX_SIDE = 2048;

async function generateDerivatives(
    bucket: string,
    originalS3Key: string,
    photoId: string,
    payload: { mimeType: string; largeKeyWebp: string; largeKeyJpg: string; thumbKey: string, originalFilename: string },
) {
    const { default: sharp } = await import('sharp');

    const getResult = await s3Client.send(new GetObjectCommand({ Bucket: bucket, Key: originalS3Key }));
    if (!getResult.Body) {
        throw new Error(`Could not read image body for ${originalS3Key}`);
    }
    const originalBytes = await getResult.Body.transformToByteArray();

    const image = sharp(originalBytes);
    const metadata = await image.metadata();
    const { width, height, size } = metadata;
    if (!width || !height) {
        throw new Error('Could not read image dimensions');
    }

    // Extract EXIF metadata
    const exif = await extractExif(originalBytes);
    if (!exif.takenAt) {
        exif.takenAt = inferDateFromFilename(payload.originalFilename);
    }

    // --- Thumb (always JPEG, 512px max side) ---
    const thumbBuffer = await sharp(originalBytes)
        .keepExif()
        .resize(THUMB_MAX_SIDE, THUMB_MAX_SIDE, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 60 })
        .toBuffer();

    await s3Client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: imageThumbKey(photoId),
        Body: thumbBuffer,
        ContentType: 'image/jpeg',
    }));

    // --- Large (always WebP; resize only if dimensions exceed limit) ---
    const needsResize = width > LARGE_MAX_SIDE || height > LARGE_MAX_SIDE;

    const largeFormat = 'webp';
    const largeContentType = 'image/webp';
    const largeBuffer = await sharp(originalBytes)
        .keepExif()
        .resize(needsResize ? LARGE_MAX_SIDE : undefined, needsResize ? LARGE_MAX_SIDE : undefined, {
            fit: 'inside',
            withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toBuffer();

    await s3Client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: imageLargeKey(photoId, largeFormat),
        Body: largeBuffer,
        ContentType: largeContentType,
    }));

    return {
        largeFormat,
        width,
        height,
        fileSizeBytes: size,
        ...exif,
    };
}

// PXL_20260201_024449009.jpg
const PIXEL_FILENAME_REGEX = /^PXL_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})\d+/;
// photo_2026-02-05_18-47-48.jpg
const TELEGRAM_FILENAME_REGEX = /^photo_(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})/;

function inferDateFromFilename(filename: string): Date | undefined {
    const basename = filename.split('/').pop() ?? filename;

    let match = PIXEL_FILENAME_REGEX.exec(basename);
    if (match) {
        const [, year, month, day, hour, minute, second] = match;
        const d = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
        if (!isNaN(d.getTime())) return d;
    }

    match = TELEGRAM_FILENAME_REGEX.exec(basename);
    if (match) {
        const [, year, month, day, hour, minute, second] = match;
        const d = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
        if (!isNaN(d.getTime())) return d;
    }

    return undefined;
}

async function extractExif(imageBytes: Uint8Array): Promise<{
    latitude?: number;
    longitude?: number;
    takenAt?: Date;
}> {
    try {
        const { default: exifr } = await import('exifr');
        const parsed = await exifr.parse(imageBytes, {
            gps: true,
            exif: true,
            tiff: false,
            ifd1: false,
            interop: false,
            translateKeys: true,
            translateValues: true,
        });
        if (!parsed) return {};

        return {
            latitude: typeof parsed.latitude === 'number' ? parsed.latitude : undefined,
            longitude: typeof parsed.longitude === 'number' ? parsed.longitude : undefined,
            takenAt: parsed.DateTimeOriginal instanceof Date ? parsed.DateTimeOriginal : undefined,
        };
    } catch (error) {
        console.log('Failed to parse EXIF data, skipping', error);
        return {};
    }
}
