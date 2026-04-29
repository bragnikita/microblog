<script setup lang="ts">
import type { MicroPost } from '~/components/microblog/PostCard.vue'

definePageMeta({ middleware: 'authenticated' })

const { data, pending } = await useFetch<{ posts: MicroPost[] }>('/api/microblog', {
  query: { visibility: 'private' },
})

const posts = computed({
  get: () => data.value?.posts ?? [],
  set: (val) => { if (data.value) data.value.posts = val },
})

function onUpdated(post: MicroPost) {
  const idx = posts.value.findIndex(p => p.id === post.id)
  if (idx !== -1) posts.value.splice(idx, 1, post)
}

function onDeleted(id: string) {
  posts.value = posts.value.filter(p => p.id !== id)
}
</script>

<template>
  <section class="mx-auto max-w-3xl">
    <div class="mb-5 rounded-[1.25rem] border border-[#ded6c4] bg-white/70 p-5 shadow-[0_10px_30px_rgba(80,72,54,0.07)] backdrop-blur">
      <NuxtLink
        to="/admin"
        class="mb-3 inline-flex items-center gap-1 font-sans text-xs font-bold uppercase tracking-[0.2em] text-[#3f6844] no-underline hover:underline"
      >
        <UIcon name="i-lucide-arrow-left" class="size-3" />
        Администрирование
      </NuxtLink>
      <h1 class="text-3xl font-medium text-[#273026]">
        Приватные записи
      </h1>
    </div>

    <div v-if="pending" class="rounded-[1.25rem] border border-[#ded6c4] bg-white/60 p-8 text-center text-[#727967]">
      Загружаем записи...
    </div>

    <div v-else-if="!data?.posts?.length" class="rounded-[1.25rem] border border-dashed border-[#b5c49a] bg-white/60 p-8 text-center text-[#727967]">
      Приватных записей нет.
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
  </section>
</template>
