export type Model = {
    id: number,
    text: string,
    timestamp: string,
    images?: {
        thumbnailUrl: string,
    }[],
    video?: {
        youtubeId: string,
    }
}