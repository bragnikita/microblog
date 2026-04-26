<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Microblog</h1>
      <UButton v-if="loggedIn" label="New Post" icon="i-lucide-plus" @click="openNew" />
    </div>

    <div v-if="status === 'pending'" class="text-center py-8 text-muted">
      Loading…
    </div>

    <div v-else-if="!posts?.length" class="text-center py-8 text-muted">
      No posts yet.
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="post in posts"
        :key="post.id"
        class="border border-default rounded-lg p-4"
      >
        <p class="whitespace-pre-wrap">{{ post.bodyText }}</p>
        <div class="flex items-center justify-between mt-3 text-sm text-muted">
          <ClientOnly><span>{{ formatDate(post.publishedAt) }}</span></ClientOnly>
          <div v-if="loggedIn" class="flex gap-2">
            <UButton
              size="xs"
              variant="ghost"
              color="neutral"
              icon="i-lucide-pencil"
              label="Edit"
              @click="openEdit(post)"
            />
            <UButton
              size="xs"
              variant="ghost"
              color="error"
              icon="i-lucide-trash-2"
              label="Delete"
              @click="confirmDelete(post)"
            />
          </div>
        </div>
      </div>
    </div>

    <MicroblogPostForm v-model:open="formOpen" :post="editingPost" @saved="onSaved" />
  </div>
</template>

<script setup lang="ts">
import { daytimes } from '#shared/formatters'

definePageMeta({
  contentWidth: 'narrow',
})

interface MicroPost {
  id: string
  slug: string | null
  bodyText: string
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

const { loggedIn } = useUserSession()
const toast = useToast()

const { data: posts, status, refresh } = useFetch<MicroPost[]>('/api/microblog')

const formOpen = ref(false)
const editingPost = ref<MicroPost | null>(null)

function formatDate(date: string | null) {
  if (!date) return ''
  return daytimes.micropost(date)
}

function openNew() {
  editingPost.value = null
  formOpen.value = true
}

function openEdit(post: MicroPost) {
  editingPost.value = post
  formOpen.value = true
}

async function confirmDelete(post: MicroPost) {
  if (!confirm('Delete this post?')) return
  try {
    await $fetch(`/api/microblog/${post.id}`, { method: 'DELETE' })
    toast.add({ title: 'Post deleted', color: 'success' })
    await refresh()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.add({ title: err?.data?.message ?? 'Error deleting post', color: 'error' })
  }
}

async function onSaved() {
  await refresh()
}
</script>
