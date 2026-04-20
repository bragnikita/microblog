<template>
  <UModal v-model:open="isOpen" :title="post ? 'Edit Post' : 'New Post'">
    <template #body>
      <UForm :state="form" :schema="formSchema" class="space-y-4" @submit="onSubmit">
        <UFormField label="Text" name="bodyText">
          <UTextarea v-model="form.bodyText" placeholder="What's on your mind?" autoresize class="w-full" />
        </UFormField>
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

interface MicroPost {
  id: string
  slug: string | null
  bodyText: string
  publishedAt: string | null
  createdAt: string
  updatedAt: string
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

watch(isOpen, (val) => {
  if (val) {
    form.bodyText = props.post?.bodyText ?? ''
  }
})

async function onSubmit() {
  loading.value = true
  try {
    if (props.post) {
      await $fetch(`/api/microblog/${props.post.id}`, {
        method: 'PUT',
        body: { bodyText: form.bodyText },
      })
      toast.add({ title: 'Post updated', color: 'success' })
    } else {
      await $fetch('/api/microblog', {
        method: 'POST',
        body: { bodyText: form.bodyText },
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
