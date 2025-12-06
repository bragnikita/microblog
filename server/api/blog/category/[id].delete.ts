import z from "zod";
import Category from "~~/server/services/categories";

export default defineEventHandler(async (event) => {
    const { id } = await getValidatedRouterParams(event, z.object({ id: z.string() }).parse)
    const categoryToDelete = await Category.get({ id }).go();
    if (!categoryToDelete.data) {
        throw new Error(`Category id=${id} not found`);
    }
    const childern = await Category.query.primary({ parentId: id }).go();
    if (childern.data.length > 0) {
        await Promise.all(
            childern.data.map(child =>
                Category.update({ id: child.id }).set({ parentId: "orphans" }).go()
            )
        );
    }
    await Category.delete({ id }).go();
})