import { Entity, EntityItem } from 'electrodb'
import { db, TableName } from './db'

export const Category = new Entity({
    model: {
        entity: 'category',
        version: '1',
        service: 'blog',
    },
    attributes: {
        id: {
            type: 'string',
            required: true,
        },
        title: {
            type: 'string',
            required: true,
        },
        parentId: {
            type: 'string',
            required: false,
        },
        description: {
            type: 'string',
            required: false,
        },
        coverImageId: {
            type: 'string',
            required: false,
        },
        childrenOrder: {
            type: 'list',
            items: {
                type: 'string'
            }
        }
    },
    indexes: {
        primary: {
            pk: {
                field: 'pk',
                composite: [],
                template: 'blog:category',
            },
            sk: {
                field: 'sk',
                composite: ['id'],
                template: '${id}',
                casing: 'none',
            },
        },
    },
}, { client: db, table: TableName })

export default Category

type CategoryType = EntityItem<typeof Category>;

export type CategoryTreeNode = CategoryType & {
    children: CategoryTreeNode[];
}

export function buildCategoryTree(categories: CategoryType[]): CategoryTreeNode[] {
    const nodes = new Map<string, CategoryTreeNode>()
    for (const cat of categories) {
        nodes.set(cat.id, { ...cat, children: [] })
    }

    const roots: CategoryTreeNode[] = []
    for (const node of nodes.values()) {
        const parentId = node.parentId
        if (parentId && nodes.has(parentId) && parentId !== node.id) {
            nodes.get(parentId)!.children.push(node)
        } else {
            roots.push(node)
        }
    }

    // Helper to sort children according to parent's childrenOrder (fallback: title)
    for (const node of nodes.values()) {
        const order = Array.isArray(node.childrenOrder) ? node.childrenOrder : []
        if (order.length) {
            const pos = new Map(order.map((id, i) => [id, i]))
            node.children.sort((a, b) => {
                const ai = pos.has(a.id) ? pos.get(a.id)! : Number.MAX_SAFE_INTEGER
                const bi = pos.has(b.id) ? pos.get(b.id)! : Number.MAX_SAFE_INTEGER
                if (ai !== bi) return ai - bi
                return a.title.localeCompare(b.title)
            })
        } else {
            node.children.sort((a, b) => a.title.localeCompare(b.title))
        }
    }

    return roots
}    