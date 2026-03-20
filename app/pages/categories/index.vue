<template>
  <div class="flex h-full min-h-[60vh]">
    <aside class="w-80 border-r border-slate-200 pr-4">
      <div class="h-full overflow-y-auto py-4">
        <UTree
          :items="treeItems"
          item-key="id"
          label-key="label"
          :model-value="state.selectedId"
          @update:modelValue="onModelUpdate"
          @select="onTreeSelect"
          @item-click="onTreeSelect"
        />
      </div>
    </aside>

    <section class="flex-1 p-6">
      <h1 class="text-2xl font-semibold mb-4">Categories</h1>
      <div v-if="!selectedCategory">Select a category to see details</div>

      <div v-else class="prose max-w-none">
        <h2>{{ selectedCategory.title }}</h2>
        <ul>
          <li><strong>id:</strong> <code>{{ selectedCategory.id }}</code></li>
          <li v-if="selectedCategory.parentId"><strong>parentId:</strong> <code>{{ selectedCategory.parentId }}</code></li>
          <li v-if="selectedCategory.description"><strong>description:</strong> {{ selectedCategory.description }}</li>
          <li v-if="Array.isArray(selectedCategory.childrenOrder) && selectedCategory.childrenOrder.length"><strong>childrenOrder:</strong> <code>{{ selectedCategory.childrenOrder.join(', ') }}</code></li>
          <li v-if="selectedCategory.coverImageId"><strong>coverImageId:</strong> <code>{{ selectedCategory.coverImageId }}</code></li>
        </ul>

        <div class="mt-4">
          <h3 class="text-lg font-medium">Raw JSON</h3>
          <pre class="bg-slate-50 p-3 rounded overflow-auto"><code>{{ selectedCategory }}</code></pre>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'

definePageMeta({ contentWidth: 'wide' })

type CategoryTreeNode = {
  id: string
  title: string
  parentId?: string
  description?: string
  coverImageId?: string
  childrenOrder?: string[]
  children?: CategoryTreeNode[]
}
type TreeItem = {
  label: string
  id: string
  raw: CategoryTreeNode
  children: TreeItem[]
}

const { data: categories } = await useFetch('/api/blog/category')

const treeData = computed(() => (categories.value ? categories.value : []))

// Map server nodes to a generic item shape used by both NuxtUI Tree and our LocalTree
const treeItems = computed(() => {
  function mapNode(n: CategoryTreeNode): TreeItem {
    return {
      label: n.title,
      id: n.id,
      raw: n,
      children: (n.children || []).map(mapNode),
    }
  }
  return (treeData.value as CategoryTreeNode[]).map((n) => mapNode(n))
})

const state = reactive({ selectedId: '' })

function findNodeById(list: CategoryTreeNode[] = [], id: string): CategoryTreeNode | null {
  for (const n of list) {
    if (n.id === id) return n
    const found = findNodeById(n.children || [], id)
    if (found) return found
  }
  return null
}

const selectedCategory = computed(() => {
  if (!state.selectedId) return null
  return findNodeById(treeData.value, state.selectedId)
})

function onTreeSelect(payload: any) {
  // Support different event payloads from various tree components
  const id = payload?.id ?? payload?.value ?? payload?.key ?? payload
  if (!id) return
  state.selectedId = id
}

function onModelUpdate(value: any) {
  // modelValue might be an id or an object/array depending on the tree API
  const id = value?.id ?? value ?? (Array.isArray(value) ? value[0] : undefined)
  if (!id) return
  state.selectedId = id
}

function getLabel(item: any) {
  return item.label || item.title || item.name || item.id
}

// expose to template
defineExpose({ selectedCategory })
</script>

<style scoped>
/* make sure left panel scrolls independently */
.aside-scroll {
  overflow-y: auto;
}
</style>
