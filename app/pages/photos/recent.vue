<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Recent Photos</h1>

    <Uploader class="mb-6" @image-processed="onImageProcessed" />

    <!-- Select mode toolbar -->
    <div class="flex items-center gap-4 mb-4">
      <USwitch v-model="selectMode" />
      <span class="text-sm text-muted">Select</span>
      <template v-if="selectMode && selectedIds.length > 0">
        <UButton
          label="Delete selected"
          color="error"
          variant="soft"
          icon="i-lucide-trash-2"
          :loading="deleting"
          @click="confirmDelete"
        />
        <span class="text-sm text-muted">{{ selectedIds.length }} selected</span>
      </template>
    </div>

    <div v-if="status === 'pending' && !photos.length" class="text-center py-8 text-muted">
      Loading…
    </div>

    <div v-else-if="!photos.length" class="text-center py-8 text-muted">
      No photos yet.
    </div>

    <template v-else>
      <ImageSelectableGrid v-model:selected="selectedIds" :images="photos" :selectable="selectMode" />

      <div v-if="nextCursor" class="flex justify-center mt-6">
        <UButton
          label="Load more"
          variant="outline"
          color="neutral"
          :loading="loadingMore"
          @click="loadMore"
        />
      </div>
    </template>

    <!-- Conflict dialog -->
    <UModal v-model:open="conflictDialog.open">
      <template #content>
        <div class="p-6 space-y-4 max-w-md">
          <h2 class="text-lg font-semibold">Cannot delete photo</h2>
          <p class="text-sm text-muted">
            This photo is linked to the following content and cannot be deleted:
          </p>
          <ul class="space-y-1">
            <li
              v-for="rel in conflictDialog.relations"
              :key="rel.contentId"
              class="text-sm"
            >
              <span class="font-mono text-xs text-muted">{{ rel.contentId }}</span>
              <span v-if="rel.slug" class="ml-2 text-primary">{{ rel.slug }}</span>
            </li>
          </ul>
          <div class="flex justify-end">
            <UButton label="Close" variant="outline" @click="conflictDialog.open = false" />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import Uploader from '~/components/photo/Uploader.vue'

definePageMeta({
  contentWidth: 'wide',
})

interface PhotoItem {
  id: string
  thumbnailUrl: string
  compressedUrl: string
  originalUrl?: string
  createdAt: string
}

interface PhotosResponse {
  items: PhotoItem[]
  nextCursor: string | null
}

interface ConflictRelation {
  contentId: string
  slug: string | null
}

interface DeleteConflictResponse {
  message: string
  relations: ConflictRelation[]
}

const loadingMore = ref(false)
const selectMode = ref(false)
const selectedIds = ref<string[]>([])
const deleting = ref(false)

const conflictDialog = ref<{ open: boolean; relations: ConflictRelation[] }>({
  open: false,
  relations: [],
})

// Clear selection when leaving select mode
watch(selectMode, (val) => {
  if (!val) selectedIds.value = []
})

const { data, status } = await useFetch<PhotosResponse>('/api/photos', {
  query: { limit: 30 },
})

const photos = ref<PhotoItem[]>(data.value?.items ?? [])
const nextCursor = ref<string | null>(data.value?.nextCursor ?? null)

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

async function onImageProcessed(_photoId: string) {
  const resp = await $fetch<PhotosResponse>('/api/photos', { query: { limit: 30 } })
  photos.value = resp.items
  nextCursor.value = resp.nextCursor
}

async function confirmDelete() {
  if (!selectedIds.value.length || deleting.value) return
  const confirmed = window.confirm(`Delete ${selectedIds.value.length} photo(s)? This cannot be undone.`)
  if (!confirmed) return
  await runDelete()
}

async function runDelete() {
  deleting.value = true
  // work on a snapshot so we can mutate selectedIds as we go
  const toDelete = [...selectedIds.value]
  try {
    for (const id of toDelete) {
      try {
        await $fetch(`/api/photos/${id}`, { method: 'DELETE' })
        // Remove from grid immediately
        photos.value = photos.value.filter((p) => p.id !== id)
        selectedIds.value = selectedIds.value.filter((s) => s !== id)
      } catch (err: any) {
        if (err?.response?.status === 409) {
          const body: DeleteConflictResponse = err.data ?? await err.response?.json()
          conflictDialog.value = { open: true, relations: body.relations ?? [] }
          // Stop the sequence; user must re-click after closing the dialog
          return
        }
        throw err
      }
    }
  } finally {
    deleting.value = false
  }
}
</script>
