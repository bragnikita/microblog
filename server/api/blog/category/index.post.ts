import z from "zod";
import { Category } from "~~/server/services/categories";

const categoryValidator = z.object({
    coverImageId: z.string().optional().nullable(),
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string().optional().nullable(),
    parentId: z.string().optional().nullable(),
});

export default defineEventHandler(async (event) => {
    const newCategory = await readValidatedBody(event, categoryValidator.parse);
    const createdCategory = await Category.create({
        title: newCategory.title,
        description: newCategory.description || undefined,
        coverImageId: newCategory.coverImageId || undefined,
        parentId: newCategory.parentId || undefined,
        id: newCategory.id
    }).go();
    return createdCategory.data;
})