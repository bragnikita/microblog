import {buildCategoryTree, Category} from '~~/server/services/categories'

export default defineEventHandler(async (event) => {
    const categories = await Category.query.primary({}).go();
    return buildCategoryTree(categories.data);
})

