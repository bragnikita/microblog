<template>
  <article
    :id="postDomId"
    class="scroll-mt-5 rounded-[1.25rem] border border-[#ded6c4] bg-[#fffdf7]/85 p-3 shadow-[0_10px_30px_rgba(80,72,54,0.07)] transition hover:border-[#6f8e63]/45 md:p-5"
  >
    <div v-if="loggedIn" class="mb-4 flex flex-wrap items-center justify-end gap-2">
      <UBadge
        :label="post.visibility === 'private' ? 'Private' : 'Public'"
        :color="post.visibility === 'private' ? 'warning' : 'primary'"
        variant="soft"
        class="mr-auto rounded-full"
      />
      <UButton
        size="xs"
        variant="soft"
        color="neutral"
        icon="i-lucide-pencil"
        label="Edit"
        class="rounded-full"
        @click="emit('edit', post)"
      />
      <UButton
        size="xs"
        variant="soft"
        color="error"
        icon="i-lucide-trash-2"
        label="Delete"
        class="rounded-full"
        @click="emit('delete', post)"
      />
    </div>

    <p class="whitespace-pre-wrap text-xl leading-relaxed text-[#273026] md:text-2xl">
      {{ post.bodyText }}
    </p>

    <!-- Attached images -->
    <MicroblogPostImages v-if="post.images?.length" :images="post.images" />

    <footer class="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 font-sans text-sm text-[#727967]">
      <ClientOnly>
        <time :datetime="post.publishedAt ?? post.createdAt">
          {{ formatDate(post.publishedAt ?? post.createdAt) }}
        </time>
      </ClientOnly>

      <NuxtLink
        v-if="post.category"
        :to="`/categories/${post.category.slug}`"
        class="text-[#3f6844] no-underline hover:underline"
      >
        #{{ post.category.name }}
      </NuxtLink>

      <UButton
        size="xs"
        variant="ghost"
        color="neutral"
        icon="i-lucide-link"
        label=""
        class="ml-auto rounded-full text-[#3f6844]"
        @click="copyPostLink"
      />
    </footer>
  </article>
</template>

<script setup lang="ts">
import { DateTime } from 'luxon'

export interface MicroPost {
  id: string
  slug: string | null
  bodyText: string
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  visibility?: 'public' | 'private'
  category?: {
    name: string
    slug: string
  } | null
  images?: { id: string; thumbnailUrl: string; compressedUrl: string }[]
}

const props = defineProps<{
  post: MicroPost
}>()

const emit = defineEmits<{
  edit: [post: MicroPost]
  delete: [post: MicroPost]
}>()

const { loggedIn } = useUserSession()
const toast = useToast()

const postDomId = computed(() => `post-${props.post.slug ?? props.post.id}`)

function formatDate(date: string | null) {
  if (!date) return ''
  const dt = DateTime.fromISO(date).setLocale('ru')
  if (!dt.isValid) return ''
  const now = DateTime.now().setLocale('ru')
  if (dt.hasSame(now, 'day')) return `сегодня, ${dt.toFormat('HH:mm')}`
  if (dt.hasSame(now.minus({ days: 1 }), 'day')) return `вчера, ${dt.toFormat('HH:mm')}`
  return dt.toFormat('d LLLL yyyy, HH:mm')
}

async function copyPostLink() {
  const url = new URL(window.location.href)
  url.hash = postDomId.value
  try {
    await navigator.clipboard.writeText(url.toString())
    toast.add({ title: 'Ссылка скопирована', color: 'primary' })
  } catch {
    toast.add({ title: url.toString(), description: 'Скопируйте ссылку вручную', color: 'warning' })
  }
}
</script>
