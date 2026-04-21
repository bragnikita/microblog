<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Recent Photos</h1>

    <div v-if="status === 'pending' && !photos.length" class="text-center py-8 text-muted">
      Loading…
    </div>

    <div v-else-if="!photos.length" class="text-center py-8 text-muted">
      No photos yet.
    </div>

    <template v-else>
      <ImageSelectableGrid :images="photos" />

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
  </div>
</template>

<script setup lang="ts">
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

const loadingMore = ref(false)

const { data, status } = await useFetch<PhotosResponse>('/api/photos', {
  query: { limit: 30 },
})

const photos = ref<PhotoItem[]>(data.value?.items ?? [])
const nextCursor = ref<string | null>(data.value?.nextCursor ?? null)

async function loadMore() {
  if (!nextCursor.value || loadingMore.value) return
  loadingMore.value = true
  try {
    const data = await $fetch<PhotosResponse>('/api/photos', {
      query: { limit: 30, cursor: nextCursor.value },
    })
    photos.value.push(...data.items)
    nextCursor.value = data.nextCursor
  } finally {
    loadingMore.value = false
  }
}
</script>
