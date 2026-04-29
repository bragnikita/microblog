<template>
  <section class="mx-auto max-w-3xl">
    <div v-if="loggedIn" class="mb-5 rounded-[1.25rem] border border-[#ded6c4] bg-white/70 p-4 shadow-[0_10px_30px_rgba(80,72,54,0.07)] backdrop-blur md:p-5">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="mb-1 font-sans text-xs font-bold uppercase tracking-[0.2em] text-[#3f6844]">
            Новые записи
          </p>
          <h2 class="text-3xl font-medium text-[#273026]">
            Микропосты
          </h2>
        </div>

        <MicroblogNewPostButton @created="onCreated" />
      </div>
    </div>

    <div v-if="pending" class="rounded-[1.25rem] border border-[#ded6c4] bg-white/60 p-8 text-center text-[#727967]">
      Загружаем записи...
    </div>

    <div v-else-if="!posts.length" class="rounded-[1.25rem] border border-dashed border-[#b5c49a] bg-white/60 p-8 text-center text-[#727967]">
      Пока нет записей.
    </div>

    <div v-else class="space-y-4">
      <MicroblogEditablePost
        v-for="post in posts"
        :key="post.id"
        :post="post"
        @updated="onUpdated"
        @deleted="onDeleted"
      />
    </div>

    <div v-if="hasMore" class="mt-6 flex justify-center">
      <UButton
        label="Загрузить ещё"
        color="primary"
        variant="soft"
        size="xl"
        class="rounded-full flex items-center"
        :loading="loadMorePending"
        @click="loadMore"
      />
    </div>

  </section>
</template>

<script setup lang="ts">
import type { MicroPost } from '~/components/microblog/PostCard.vue'

definePageMeta({
  contentWidth: 'wide',
})

const { loggedIn } = useUserSession()
const toast = useToast()

const posts = ref<MicroPost[]>([])
const hasMore = ref(false)
const pending = ref(false)
const loadMorePending = ref(false)

async function fetchPage(offset: number) {
  const data = await $fetch<{ posts: MicroPost[]; hasMore: boolean }>('/api/microblog', {
    query: { offset },
  })
  return data
}

pending.value = true
try {
  const data = await fetchPage(0)
  posts.value = data.posts
  hasMore.value = data.hasMore
} finally {
  pending.value = false
}

async function loadMore() {
  loadMorePending.value = true
  try {
    const data = await fetchPage(posts.value.length)
    posts.value.push(...data.posts)
    hasMore.value = data.hasMore
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.add({ title: err?.data?.message ?? 'Error loading posts', color: 'error' })
  } finally {
    loadMorePending.value = false
  }
}

function onCreated(post: MicroPost) {
  posts.value.unshift(post)
}

function onUpdated(post: MicroPost) {
  const idx = posts.value.findIndex(p => p.id === post.id)
  if (idx !== -1) posts.value.splice(idx, 1, post)
}

function onDeleted(id: string) {
  posts.value = posts.value.filter(p => p.id !== id)
}
</script>
