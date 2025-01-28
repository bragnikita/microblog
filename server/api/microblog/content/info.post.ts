import { Resource } from "sst";
import { z } from "zod";
import { Image, ResourceJobStatus } from "~/server/services/db";
import { CONTENT_MINIFIED_PREFIX, CONTENT_ORIGINAL_PREFIX } from "~/shared/constants";

const Validator = z.object({
    imageKeys: z.array(z.string())
});

export default defineWrappedResponseHandler(async (event) => {
    const body = await readValidatedBody(event, Validator.parse);
    const images = await Promise.all(body.imageKeys.map(async (key) => {
        const image = await Image.get({ key }).go();
        if (!image.data) {
            return null;
        }
        return image.data;
    })).then((images) => images.filter((image) => image !== null));

    return {
        items: images.map((image) => ({
            key: image.key,
            thumbnailUrl: image.preprocessingStatus === ResourceJobStatus.Completed ? (Resource.main.url + '/' + CONTENT_MINIFIED_PREFIX + image.key) : null,
            originalUrl: Resource.main.url + '/' + CONTENT_ORIGINAL_PREFIX + image.key,
            isProcessing: image.preprocessingStatus && [ResourceJobStatus.Processing, ResourceJobStatus.Waiting].includes(image.preprocessingStatus),
            isProcessed: image.preprocessingStatus === ResourceJobStatus.Completed,
            isUploadFailed: image.preprocessingStatus === ResourceJobStatus.Failed,
        }))
    }
})