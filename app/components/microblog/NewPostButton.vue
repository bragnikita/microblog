<template>
  <div>
    <UButton
      label="New Post"
      icon="i-lucide-plus"
      color="primary"
      variant="soft"
      class="rounded-full"
      @click="formOpen = true"
    />
    <MicroblogPostForm
      v-model:open="formOpen"
      :post="null"
      @saved="onSaved"
    />
  </div>
</template>

<script setup lang="ts">
import type { MicroPost } from '~/components/microblog/PostCard.vue'

const emit = defineEmits<{
  created: [post: MicroPost]
}>()

const toast = useToast()
const formOpen = ref(false)

async function onSaved() {
  try {
    const data = await $fetch<{ posts: MicroPost[] }>('/api/microblog', {
      query: { offset: 0, limit: 1 },
    })
    const newest = data.posts[0]
    if (newest) emit('created', newest)
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.add({ title: err?.data?.message ?? 'Error loading new post', color: 'error' })
  }
}
</script>
