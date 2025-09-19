export type Model = {
    id: string,
    text?: string,
    title?: string,
    timestamp: string,
    images?: {
        key: string,
        thumbnailUrl: string,
        compressedUrl: string,
        originalUrl: string,
    }[],
    video?: {
        youtubeId?: string,
    }
}