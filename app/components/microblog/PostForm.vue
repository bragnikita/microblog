<template>
  <UModal v-model:open="isOpen" :title="post ? 'Edit Post' : 'New Post'">
    <template #body>
      <UForm :state="form" :schema="formSchema" class="space-y-4" @submit="onSubmit">
        <UFormField label="Text" name="bodyText">
          <UTextarea v-model="form.bodyText" placeholder="What's on your mind?" autoresize class="w-full" />
        </UFormField>

        <!-- Sortable attached images panel -->
        <div v-show="attachedImages.length > 0" ref="sortableParent" class="flex flex-wrap gap-2">
          <div
            v-for="img in attachedImages"
            :key="img.id"
            class="relative w-20 h-20 rounded overflow-hidden bg-gray-100 shrink-0 cursor-grab active:cursor-grabbing"
            :style="img.previewUrl ? { backgroundImage: `url('${img.previewUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}"
          >
            <button
              type="button"
              class="absolute top-0 right-0 w-5 h-5 flex items-center justify-center rounded-bl bg-black/60 hover:bg-black/80 transition-colors"
              aria-label="Remove image"
              @click="removeAttached(img.id)"
            >
              <UIcon name="lucide:x" class="w-3 h-3 text-white" />
            </button>
          </div>
        </div>

        <!-- Image uploader -->
        <PhotoUploader @image-processed="onImageProcessed" />

        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="outline" label="Cancel" @click="isOpen = false" />
          <UButton type="submit" :loading="loading" label="Save" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { dragAndDrop } from '@formkit/drag-and-drop/vue'

interface MicroPost {
  id: string
  slug: string | null
  bodyText: string
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

interface AttachedImage {
  id: string
  previewUrl: string
}

const props = defineProps<{
  post?: MicroPost | null
}>()

const emit = defineEmits<{
  saved: []
}>()

const isOpen = defineModel<boolean>('open', { default: false })

const formSchema = z.object({
  bodyText: z.string().nonempty('Text is required'),
})

const form = reactive({
  bodyText: '',
})

const loading = ref(false)
const toast = useToast()

const sortableParent = ref<HTMLElement | null>(null)
const attachedImages = ref<AttachedImage[]>([])

watch(sortableParent, (el) => {
  if (el) dragAndDrop({ parent: el, values: attachedImages })
})


watch(isOpen, async (val) => {
  if (val) {
    form.bodyText = props.post?.bodyText ?? ''
    attachedImages.value.splice(0)
    if (props.post) {
      try {
        const url = `/api/microblog/${props.post.id}` as string
        const data = await $fetch<{ images: { id: string; thumbnailUrl: string }[] }>(url)
        attachedImages.value.splice(0, 0, ...data.images.map((img) => ({
          id: img.id,
          previewUrl: img.thumbnailUrl,
        })))
      } catch {
        // non-fatal — form still works without pre-loaded images
      }
    }
  }
})

function onImageProcessed(photoId: string, previewUrl: string) {
  attachedImages.value.push({ id: photoId, previewUrl })
}

function removeAttached(id: string) {
  const idx = attachedImages.value.findIndex(img => img.id === id)
  if (idx !== -1) attachedImages.value.splice(idx, 1)
}

async function onSubmit() {
  loading.value = true
  try {
    if (props.post) {
      await $fetch(`/api/microblog/${props.post.id}`, {
        method: 'PUT',
        body: {
          content: form.bodyText,
          images: attachedImages.value.map(img => img.id),
        },
      })
      toast.add({ title: 'Post updated', color: 'success' })
    } else {
      await $fetch('/api/microblog', {
        method: 'POST',
        body: {
          content: form.bodyText,
          images: attachedImages.value.map(img => img.id),
        },
      })
      toast.add({ title: 'Post created', color: 'success' })
    }
    isOpen.value = false
    emit('saved')
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.add({ title: err?.data?.message ?? 'Error saving post', color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>
