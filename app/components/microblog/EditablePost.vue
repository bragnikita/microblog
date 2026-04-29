<template>
  <div>
    <MicroblogPostCard
      :post="post"
      @edit="formOpen = true"
      @delete="confirmDelete"
    />
    <MicroblogPostForm
      v-model:open="formOpen"
      :post="post"
      @saved="onSaved"
    />
  </div>
</template>

<script setup lang="ts">
import type { MicroPost } from '~/components/microblog/PostCard.vue'

const props = defineProps<{
  post: MicroPost
}>()

const emit = defineEmits<{
  updated: [post: MicroPost]
  deleted: [id: string]
}>()

const toast = useToast()
const formOpen = ref(false)
const deleting = ref(false)

async function confirmDelete() {
  if (!confirm('Delete this post?')) return
  deleting.value = true
  try {
    await $fetch(`/api/microblog/${props.post.id}`, { method: 'DELETE' })
    toast.add({ title: 'Post deleted', color: 'success' })
    emit('deleted', props.post.id)
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.add({ title: err?.data?.message ?? 'Error deleting post', color: 'error' })
  } finally {
    deleting.value = false
  }
}

async function onSaved() {
  try {
    const updated = await $fetch<MicroPost>(`/api/microblog/${props.post.id}`)
    emit('updated', updated)
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.add({ title: err?.data?.message ?? 'Error refreshing post', color: 'error' })
  }
}
</script>
