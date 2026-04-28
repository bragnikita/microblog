<script setup lang="ts">
definePageMeta({ middleware: 'authenticated' })

const { data, pending } = await useFetch('/api/microblog', {
  query: { visibility: 'private' },
})
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
      <MicroblogPostCard
        v-for="post in data.posts"
        :key="post.id"
        :post="post"
      />
    </div>
  </section>
</template>
