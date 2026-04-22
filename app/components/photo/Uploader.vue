<template>
  <div class="w-full flex flex-col gap-3">
    <input
      ref="fileInput"
      type="file"
      multiple
      accept="image/jpeg,image/png,image/webp,image/heic"
      class="hidden"
      @change="onFilesSelected"
    />

    <div v-if="items.length > 0" class="flex flex-wrap gap-3">
      <div
        v-for="item in items"
        :key="item.localId"
        class="relative w-50 h-50 border border-gray-300 box-border flex items-center justify-center bg-center bg-no-repeat bg-cover bg-gray-100 overflow-visible"
        :style="item.previewUrl ? { backgroundImage: `url('${item.previewUrl}')` } : {}"
      >
        <!-- Spinner overlay for active states -->
        <div
          v-if="item.status === 'reading' || item.status === 'uploading' || item.status === 'processing'"
          class="absolute inset-0 flex flex-col items-center justify-center bg-black/30"
        >
          <UIcon name="lucide:loader-2" class="w-10 h-10 animate-spin text-white" />
          <span class="text-white text-xs mt-1 font-medium">{{ statusLabel(item.status) }}</span>
        </div>

        <!-- Success overlay (briefly shown before auto-removal) -->
        <div
          v-else-if="item.status === 'completed'"
          class="absolute inset-0 flex items-center justify-center bg-black/20"
        >
          <UIcon name="lucide:check-circle" class="w-12 h-12 text-green-400" />
        </div>

        <!-- Error overlay -->
        <div
          v-else-if="item.status === 'failed'"
          class="absolute inset-0 flex flex-col items-center justify-center bg-black/50 p-2"
        >
          <UIcon name="lucide:alert-circle" class="w-8 h-8 text-red-400 mb-1" />
          <span class="text-white text-xs text-center leading-tight">{{ item.errorMessage || 'Upload failed' }}</span>
        </div>

        <!-- Delete / remove button (hidden when completed) -->
        <button
          v-if="item.status !== 'completed'"
          class="cursor-pointer absolute z-10 w-6 h-6 flex items-center justify-center rounded-full bg-black border-2 border-white hover:bg-neutral-900 transition-colors duration-150 shadow"
          style="top: 0; right: 0; transform: translate(50%, -50%);"
          aria-label="Remove"
          @click="removeItem(item.localId)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="white" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <div
      class="w-full h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-gray-500 transition-colors"
      @click="fileInput?.click()"
    >
      <UIcon name="lucide:image-plus" class="w-8 h-8 text-gray-400" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

type UploadStatus = 'reading' | 'uploading' | 'processing' | 'completed' | 'failed'

interface UploadItem {
  localId: string
  previewUrl?: string
  status: UploadStatus
  photoId?: string
  errorMessage?: string
}

const emit = defineEmits<{
  (e: 'imageProcessed', photoId: string): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const items = ref<UploadItem[]>([])
let pollInterval: ReturnType<typeof setInterval> | null = null
let localIdCounter = 0

function statusLabel(status: UploadStatus): string {
  switch (status) {
    case 'reading': return 'Reading...'
    case 'uploading': return 'Uploading...'
    case 'processing': return 'Processing...'
    default: return ''
  }
}

function removeItem(localId: string) {
  items.value = items.value.filter(i => i.localId !== localId)
}

function startPolling() {
  if (pollInterval !== null) return
  pollInterval = setInterval(poll, 2000)
}

function stopPolling() {
  if (pollInterval !== null) {
    clearInterval(pollInterval)
    pollInterval = null
  }
}

async function poll() {
  const processingItems = items.value.filter(i => i.status === 'processing' && i.photoId)
  if (processingItems.length === 0) {
    stopPolling()
    return
  }

  const ids = processingItems.map(i => i.photoId!).join(',')

  try {
    const results = await $fetch('/api/photos/jobs', { query: { ids } })

    for (const job of results) {
      const item = items.value.find(i => i.photoId === job.id)
      if (!item) continue

      if (job.status === 'completed') {
        item.status = 'completed'
        emit('imageProcessed', job.id)
        const localId = item.localId
        setTimeout(() => removeItem(localId), 3000)
      }
      else if (job.status === 'failed') {
        item.status = 'failed'
        item.errorMessage = job.statusMessage ?? 'Processing failed'
      }
    }

    const stillProcessing = items.value.some(i => i.status === 'processing' && i.photoId)
    if (!stillProcessing) {
      stopPolling()
    }
  }
  catch {
    // Non-fatal — will retry on next interval tick
  }
}

async function processFile(file: File, localId: string) {
  // Step 1: Generate local preview via FileReader
  const previewUrl = await new Promise<string>((resolve) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target!.result as string)
    reader.readAsDataURL(file)
  })

  const item = items.value.find(i => i.localId === localId)
  if (!item) return // Removed by user before preview loaded

  item.previewUrl = previewUrl
  item.status = 'uploading'

  try {
    // Step 2: Request a presigned upload URL
    const { jobId, uploadUrl } = await $fetch('/api/photos/upload', {
      method: 'POST',
      body: { mimeType: file.type, originalFilename: file.name },
    })

    const afterRequest = items.value.find(i => i.localId === localId)
    if (!afterRequest) return

    afterRequest.photoId = jobId

    // Step 3: Upload the file directly to S3 via presigned URL
    // Using native fetch to avoid ofetch adding headers that would break the S3 signature
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    })

    if (!uploadResponse.ok) {
      throw new Error(`S3 upload failed: ${uploadResponse.status}`)
    }

    const afterUpload = items.value.find(i => i.localId === localId)
    if (!afterUpload) return

    afterUpload.status = 'processing'
    startPolling()
  }
  catch (err: unknown) {
    const failed = items.value.find(i => i.localId === localId)
    if (!failed) return
    failed.status = 'failed'
    failed.errorMessage = err instanceof Error ? err.message : 'Upload failed'
  }
}

function onFilesSelected(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files?.length) return

  const selected = Array.from(input.files)
  input.value = '' // Reset so the same files can be re-selected later

  for (const file of selected) {
    const localId = `local-${++localIdCounter}`
    items.value.push({ localId, status: 'reading' })
    processFile(file, localId) // fire-and-forget; errors handled inside
  }
}

onUnmounted(() => {
  stopPolling()
})
</script>
