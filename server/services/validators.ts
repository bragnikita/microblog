import z from "zod";

export const PostIdValidator = z.object({
    id: z.string().nonempty(),
});

export const PostValidator = z.object({
    text: z.string().optional(),
    title: z.string().optional(),
    images: z.array(z.object({
        id: z.string().nonempty(),
    })).optional(),
    video: z.object({
        youtubeId: z.string().nonempty(),
    }).optional(),
    visibility: z.enum(['public', 'private', 'draft'] as const).default('private'),
}
).refine(data => data.text || data.images || data.video, { message: 'At least one of text, images or video must be provided' });