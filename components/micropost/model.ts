export type Model = {
    id: number,
    text?: string,
    timestamp: string,
    images?: {
        key: string,
        thumbnailUrl: string,
        originalUrl: string,
    }[],
    video?: {
        youtubeId?: string,
    }
}