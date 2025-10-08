export type Image = {
    id: string,
    thumbnailUrl: string,
    compressedUrl: string,
    originalUrl?: string
    compressedWidth?: number,
    compressedHeight?: number,
    originalFileSize?: number
}

export type MicroPostContent = {
    text?: string,
    title?: string,
    images: Image[],
    video?: {
        youtubeId?: string
    },
    location?: {
        lat?: number,
        lon?: number,
        label?: string
    },
    links?: Array<{
        url: string,
        title?: string
    }>
}

export type Tag = {
    id: string;
    name: string;
    description?: string;
    color?: string; // hex color code
}

export type Category = {
    id: string;
    name: string;
    description?: string;
    color?: string; // hex color code
}

export type PublicMicroPost = {
    id: string;
    publishedAt: string;
    content: MicroPostContent;
    tags: Tag[];
    category?: Category;
}

export type Visibility = 'public' | 'private' | 'draft';

export type MicroPostFull = {
    id: string;
    publishedAt?: string;
    createdAt: string;
    content: MicroPostContent
    visibility: Visibility;
    tags: Tag[];
    category?: Category;
    createdAt: string;
}