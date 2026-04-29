<template>
  <UModal v-model:open="isOpen" fullscreen :ui="{ content: 'flex flex-col' }">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <h2 class="text-lg font-semibold">Select Photos</h2>
        <span class="text-sm text-muted">
          <template v-if="maxSelect">
            {{ selectedIds.length }} / {{ maxSelect }} selected
          </template>
          <template v-else-if="selectedIds.length > 0">
            {{ selectedIds.length }} selected
          </template>
        </span>
      </div>
    </template>

    <template #body>
      <div v-if="loading" class="flex-1 flex items-center justify-center text-muted py-16">
        Loading…
      </div>

      <div v-else-if="!photos.length" class="flex-1 flex items-center justify-center text-muted py-16">
        No photos yet.
      </div>

      <template v-else>
        <ImageSelectableGrid
          v-model:selected="selectedIds"
          :images="photos"
          :selectable="true"
        />

        <div v-if="nextCursor" class="flex justify-center mt-4 mb-2">
          <UButton
            label="Load more"
            variant="outline"
            color="neutral"
            :loading="loadingMore"
            @click="loadMore"
          />
        </div>
      </template>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3 w-full">
        <UButton label="Cancel" color="neutral" variant="outline" @click="isOpen = false" />
        <UButton
          label="Confirm"
          color="primary"
          :disabled="selectedIds.length === 0"
          @click="confirm"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { SelectableGridImage } from '~/components/image/SelectableGrid.vue'

const props = defineProps<{
  maxSelect?: number
}>()

const emit = defineEmits<{
  select: [ids: string[]]
}>()

const isOpen = defineModel<boolean>('open', { default: false })

interface PhotosResponse {
  items: SelectableGridImage[]
  nextCursor: string | null
}

const photos = ref<SelectableGridImage[]>([])
const nextCursor = ref<string | null>(null)
const loading = ref(false)
const loadingMore = ref(false)
const selectedIds = ref<string[]>([])

watch(isOpen, async (val) => {
  if (!val) return
  selectedIds.value = []
  photos.value = []
  nextCursor.value = null
  loading.value = true
  try {
    const resp = await $fetch<PhotosResponse>('/api/photos', { query: { limit: 30 } })
    photos.value = resp.items
    nextCursor.value = resp.nextCursor
  } finally {
    loading.value = false
  }
})

// Block selection beyond maxSelect (option A: ignore the click)
watch(selectedIds, (next, prev) => {
  if (props.maxSelect && next.length > props.maxSelect) {
    selectedIds.value = prev
  }
}, { deep: true })

async function loadMore() {
  if (!nextCursor.value || loadingMore.value) return
  loadingMore.value = true
  try {
    const resp = await $fetch<PhotosResponse>('/api/photos', {
      query: { limit: 30, cursor: nextCursor.value },
    })
    photos.value.push(...resp.items)
    nextCursor.value = resp.nextCursor
  } finally {
    loadingMore.value = false
  }
}

function confirm() {
  emit('select', [...selectedIds.value])
  isOpen.value = false
}
</script>
