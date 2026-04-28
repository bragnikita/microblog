<script setup lang="ts">
import { DateTime } from 'luxon'
import type { MicroPost } from '~/components/microblog/PostCard.vue'

definePageMeta({ layout: 'clear' })

const route = useRoute()
const slug = route.params.slug as string

const { data: post, error } = await useFetch<MicroPost & { category?: { name: string; slug: string } | null }>(
  `/api/microblog/by-slug/${slug}`,
)

if (error.value) {
  throw createError({ statusCode: error.value.statusCode ?? 404, statusMessage: 'Post not found' })
}

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found' })
}

// TODO use the post title
const title = 'Haji no Tabi'
const description = computed(() => post.value?.bodyText?.slice(0, 160) ?? '')
const ogImage = computed(() => post.value?.images?.[0]?.thumbnailUrl ?? undefined)

const publishedDate = computed(() => {
  const date = post.value?.publishedAt ?? post.value?.createdAt
  if (!date) return ''
  const dt = DateTime.fromISO(date).setLocale('ru')
  return dt.isValid ? dt.toFormat('d LLLL yyyy, HH:mm') : ''
})

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogImage,
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <section class="mx-auto max-w-3xl">

    <article
      v-if="post"
      class="rounded-[1.25rem] border border-[#ded6c4] bg-[#fffdf7]/85 p-5 shadow-[0_10px_30px_rgba(80,72,54,0.07)] md:p-8"
    >
      <p class="whitespace-pre-wrap text-xl leading-relaxed text-[#273026] md:text-2xl">
        {{ post.bodyText }}
      </p>

      <MicroblogPostImages v-if="post.images?.length" :images="post.images" />

      <footer class="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#ded6c4]/60 pt-4 font-sans text-sm text-[#727967]">
        <ClientOnly>
          <time :datetime="post.publishedAt ?? post.createdAt">
            {{ publishedDate }}
          </time>
        </ClientOnly>

        <NuxtLink
          v-if="post.category"
          :to="`/categories/${post.category.slug}`"
          class="text-[#3f6844] no-underline hover:underline"
        >
          #{{ post.category.name }}
        </NuxtLink>
      </footer>
    </article>
  </section>
</template>
