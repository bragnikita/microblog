<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Categories</h1>

    <ClientOnly>
      <template #fallback>
        <div class="flex items-center justify-center py-16">
          <UIcon name="i-lucide-loader-circle" class="animate-spin size-8 text-muted" />
        </div>
      </template>

      <div v-if="loading" class="flex items-center justify-center py-16">
        <UIcon name="i-lucide-loader-circle" class="animate-spin size-8 text-muted" />
      </div>

      <div v-else class="grid grid-cols-[200px_1fr] gap-8 items-start">
        <!-- Left: tree -->
        <div>
          <div class="flex gap-2 mb-3">
            <UButton label="Add" icon="i-lucide-plus" size="sm" :loading="adding" @click="addRoot" />
            <UButton label="Add child" icon="i-lucide-corner-down-right" size="sm" variant="outline" :disabled="!selected || adding" :loading="adding" @click="addChild" />
          </div>
          <p v-if="!treeItems.length" class="text-sm text-muted py-6 text-center">No categories yet.</p>
          <UTree v-else v-model="selected" :items="treeItems" :get-key="(item) => item.id" color="neutral" />
        </div>

        <!-- Right: editor -->
        <div v-if="selected" class="space-y-4 max-w-lg">
          <UFormField label="Name"><UInput v-model="form.name" class="w-full" /></UFormField>
          <UFormField label="Slug"><UInput v-model="form.slug" class="w-full" /></UFormField>
          <UFormField label="Description"><UTextarea v-model="form.descriptionText" class="w-full" /></UFormField>
          <UFormField label="Sort order"><UInput v-model.number="form.sortOrder" type="number" class="w-full" /></UFormField>
          <UFormField label="Visibility">
            <USelect v-model="form.visibility" :items="[{ label: 'Public', value: 'public' }, { label: 'Private', value: 'private' }]" class="w-full" />
          </UFormField>
          <div class="flex gap-3 pt-2">
            <UButton label="Save" :loading="saving" @click="saveCategory" />
            <UButton label="Delete" color="error" variant="soft" icon="i-lucide-trash-2" :loading="deleting" @click="deleteCategory" />
          </div>
        </div>
        <p v-else class="text-sm text-muted py-10 text-center">Select a category to edit its details.</p>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import type { TreeItem } from '@nuxt/ui'

definePageMeta({
  contentWidth: 'wide',
})

interface CatTreeItem extends TreeItem {
  id: string
  slug: string
  name: string
  descriptionText: string | null
  parentCategoryId: string | null
  sortOrder: number
  visibility: 'public' | 'private'
  children?: CatTreeItem[]
}

interface ApiCategory {
  id: string
  slug: string
  name: string
  descriptionText: string | null
  parentCategoryId: string | null
  sortOrder: number
  visibility: string
}

const loading = ref(true)
const adding = ref(false)
const saving = ref(false)
const deleting = ref(false)

const treeItems = ref<CatTreeItem[]>([])
const selected = ref<CatTreeItem | undefined>()

const form = reactive({
  name: '',
  slug: '',
  descriptionText: '',
  sortOrder: 0,
  visibility: 'public' as 'public' | 'private',
})

onMounted(async () => {
  try {
    const cats = await $fetch<ApiCategory[]>('/api/categories')
    treeItems.value = buildTree(cats)
  } finally {
    loading.value = false
  }
})

function buildTree(cats: ApiCategory[]): CatTreeItem[] {
  const map = new Map<string, CatTreeItem>()
  for (const cat of cats) {
    map.set(cat.id, {
      id: cat.id,
      label: cat.name,
      defaultExpanded: true,
      slug: cat.slug,
      name: cat.name,
      descriptionText: cat.descriptionText,
      parentCategoryId: cat.parentCategoryId,
      sortOrder: cat.sortOrder,
      visibility: cat.visibility as 'public' | 'private',
      children: [],
    })
  }
  const roots: CatTreeItem[] = []
  for (const cat of cats) {
    const item = map.get(cat.id)!
    if (cat.parentCategoryId && map.has(cat.parentCategoryId)) {
      map.get(cat.parentCategoryId)!.children!.push(item)
    } else {
      roots.push(item)
    }
  }
  for (const item of map.values()) {
    if (item.children?.length === 0) item.children = undefined
  }
  return roots
}

function findById(items: CatTreeItem[], id: string): CatTreeItem | undefined {
  for (const item of items) {
    if (item.id === id) return item
    if (item.children) {
      const found = findById(item.children, id)
      if (found) return found
    }
  }
}

function removeById(items: CatTreeItem[], id: string): boolean {
  for (let i = 0; i < items.length; i++) {
    if (items[i]!.id === id) {
      items.splice(i, 1)
      return true
    }
    const children = items[i]!.children
    if (children && removeById(children, id)) {
      if (children.length === 0) items[i]!.children = undefined
      return true
    }
  }
  return false
}

watch(selected, (item) => {
  if (!item) return
  form.name = item.name
  form.slug = item.slug
  form.descriptionText = item.descriptionText ?? ''
  form.sortOrder = item.sortOrder
  form.visibility = item.visibility
})

function toCatTreeItem(cat: ApiCategory): CatTreeItem {
  return {
    id: cat.id,
    label: cat.name,
    defaultExpanded: true,
    slug: cat.slug,
    name: cat.name,
    descriptionText: cat.descriptionText,
    parentCategoryId: cat.parentCategoryId,
    sortOrder: cat.sortOrder,
    visibility: cat.visibility as 'public' | 'private',
  }
}

async function addRoot() {
  adding.value = true
  try {
    const cat = await $fetch<ApiCategory>('/api/categories', {
      method: 'POST',
      body: {
        name: 'category_name',
        slug: `new-category-${Date.now()}`,
        sortOrder: 0,
        visibility: 'public',
      },
    })
    const item = toCatTreeItem(cat)
    treeItems.value.push(item)
    selected.value = item
  } finally {
    adding.value = false
  }
}

async function addChild() {
  if (!selected.value) return
  const parentId = selected.value.id
  adding.value = true
  try {
    const cat = await $fetch<ApiCategory>('/api/categories', {
      method: 'POST',
      body: {
        name: 'category_name',
        slug: `new-category-${Date.now()}`,
        sortOrder: 0,
        visibility: 'public',
        parentCategoryId: parentId,
      },
    })
    const item = toCatTreeItem(cat)
    const parent = findById(treeItems.value, parentId)
    if (parent) {
      if (!parent.children) parent.children = []
      parent.children.push(item)
      parent.defaultExpanded = true
    } else {
      treeItems.value.push(item)
    }
    selected.value = item
  } finally {
    adding.value = false
  }
}

async function saveCategory() {
  if (!selected.value) return
  saving.value = true
  try {
    const cat = await $fetch<ApiCategory>(`/api/categories/${selected.value.id}`, {
      method: 'PUT',
      body: {
        name: form.name,
        slug: form.slug,
        descriptionText: form.descriptionText || null,
        sortOrder: form.sortOrder,
        visibility: form.visibility,
        parentCategoryId: selected.value.parentCategoryId,
      },
    })
    const item = findById(treeItems.value, selected.value.id)
    if (item) {
      item.label = cat.name
      item.name = cat.name
      item.slug = cat.slug
      item.descriptionText = cat.descriptionText
      item.sortOrder = cat.sortOrder
      item.visibility = cat.visibility as 'public' | 'private'
    }
  } finally {
    saving.value = false
  }
}

async function deleteCategory() {
  if (!selected.value) return
  if (!window.confirm(`Delete "${selected.value.name}"? This cannot be undone.`)) return
  deleting.value = true
  try {
    await $fetch(`/api/categories/${selected.value.id}`, { method: 'DELETE' })
    removeById(treeItems.value, selected.value.id)
    selected.value = undefined
  } finally {
    deleting.value = false
  }
}
</script>
