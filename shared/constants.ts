export const IMAGES_ORIGINALS_PREFIX = 'files/images/originals/'
export const IMAGES_DROP_PREFIX = 'files/images/drop/'
export const IMAGES_PREFIX = 'files/images/'

export function imageOriginalKey(photoId: string): string {
    return `${IMAGES_ORIGINALS_PREFIX}${photoId}/original`
}

export function imageThumbKey(photoId: string): string {
    return `${IMAGES_PREFIX}${photoId}/thumb.jpg`
}

export function imageLargeKey(photoId: string, format: string): string {
    return `${IMAGES_PREFIX}${photoId}/large.${format}`
}