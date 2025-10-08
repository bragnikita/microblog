import type { EntityItem } from "electrodb";
import type { PublicMicroPost } from "~~/shared/api/microblog";
import { MicroPost } from "../../services/db.js";
import { ImageResources } from '../s3';

type MicroPostItem = EntityItem<typeof MicroPost>;

export class MicroPostMapper {
    async loadDependencies() { }

    mapPublicMicroPost = (item: MicroPostItem): PublicMicroPost => {
        return {
            id: item.id,
            publishedAt: item.publishedAt || '',
            content: {
                text: item.content.text,
                title: item.content.title,
                images: item.content.images?.map(image => ({
                    id: image.id,
                    thumbnailUrl: ImageResources.thumbnail(image.id),
                    compressedUrl: ImageResources.compressed(image.id),
                    originalUrl: ImageResources.original(image.id),
                    compressedWidth: image.compressedSides ? ImageResources.sizeStringToNumbers(image.compressedSides).width : undefined,
                    compressedHeight: image.compressedSides ? ImageResources.sizeStringToNumbers(image.compressedSides).height : undefined,
                    originalFileSize: image.originalFileSize
                })) ?? [],
                video: item.content.video ? {
                    youtubeId: item.content.video.youtubeId
                } : undefined,
                location: item.content.location,
                links: item.content.links,
            },
            tags: (item.tags || []).map(tag => ({
                id: tag,
                name: tag,
                description: '',
            })),
        };
    }

    mapPrivateMicroPost = (item: MicroPostItem) => {
        const pub = this.mapPublicMicroPost(item);
        return {
            ...pub,
            visibility: item.visibility,
            createdAt: item.createdAt,
        }
    }
}


