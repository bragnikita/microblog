export type Model = {
    id: number,
    text?: string,
    title?: string,
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