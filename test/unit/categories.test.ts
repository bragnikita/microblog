import { describe, it, expect } from 'vitest'
import { buildCategoryTree } from '../../server/services/categories'

// Minimal category shape matching what's used by buildCategoryTree
type Cat = {
  id: string
  title: string
  parentId?: string
  childrenOrder?: string[]
}

describe('buildCategoryTree', () => {
  it('returns all items as roots when no parentId set', () => {
    const cats: Cat[] = [
      { id: 'a', title: 'Alpha' },
      { id: 'b', title: 'Beta' },
    ]

    const tree = buildCategoryTree(cats as any)
    expect(tree).toHaveLength(2)
    const ids = tree.map((n) => n.id).sort()
    expect(ids).toEqual(['a', 'b'])
  })

  it('attaches child to parent when parentId is present', () => {
    const cats: Cat[] = [
      { id: 'p', title: 'Parent' },
      { id: 'c', title: 'Child', parentId: 'p' },
    ]

    const tree = buildCategoryTree(cats as any)
    expect(tree).toHaveLength(1)
    expect(tree[0].id).toBe('p')
    expect(tree[0].children).toHaveLength(1)
    expect(tree[0].children[0].id).toBe('c')
  })

  it('respects childrenOrder when sorting children', () => {
    const cats: Cat[] = [
      { id: 'p', title: 'Parent', childrenOrder: ['c2', 'c1', 'c4', 'c3'] },
      { id: 'c1', title: 'Child One', parentId: 'p' },
      { id: 'c2', title: 'Child Two', parentId: 'p' },
      { id: 'c3', title: 'Child Three', parentId: 'p' },
      { id: 'c4', title: 'Child Four', parentId: 'p' },
    ]

    const tree = buildCategoryTree(cats as any)
    expect(tree).toHaveLength(1)
    expect(tree[0].children.map((c) => c.id)).toEqual(['c2', 'c1', 'c4', 'c3'])
  })

  it('falls back to title sorting when childrenOrder is absent', () => {
    const cats: Cat[] = [
      { id: 'p', title: 'Parent' },
      { id: 'c1', title: 'Banana', parentId: 'p' },
      { id: 'c2', title: 'Apple', parentId: 'p' },
    ]

    const tree = buildCategoryTree(cats as any)
    expect(tree).toHaveLength(1)
    expect(tree[0].children.map((c) => c.id)).toEqual(['c2', 'c1'])
  })

  it('treats a node with parentId equal to itself as a root (ignores self-parent)', () => {
    const cats: Cat[] = [
      { id: 'x', title: 'Self', parentId: 'x' },
    ]

    const tree = buildCategoryTree(cats as any)
    expect(tree).toHaveLength(1)
    expect(tree[0].id).toBe('x')
    expect(tree[0].children).toHaveLength(0)
  })
})
