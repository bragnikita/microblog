<template>
  <section class="mx-auto max-w-3xl">
    <div class="mb-5 rounded-[1.25rem] border border-[#ded6c4] bg-white/70 p-4 shadow-[0_10px_30px_rgba(80,72,54,0.07)] backdrop-blur md:p-5">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="mb-1 font-sans text-xs font-bold uppercase tracking-[0.2em] text-[#3f6844]">
            Новые записи
          </p>
          <h2 class="text-3xl font-medium text-[#273026]">
            Микропосты
          </h2>
        </div>

        <UButton
          v-if="loggedIn"
          label="New Post"
          icon="i-lucide-plus"
          color="primary"
          variant="soft"
          class="rounded-full"
          @click="openNew"
        />
      </div>
    </div>

    <div v-if="status === 'pending'" class="rounded-[1.25rem] border border-[#ded6c4] bg-white/60 p-8 text-center text-[#727967]">
      Загружаем записи...
    </div>

    <div v-else-if="!posts?.length" class="rounded-[1.25rem] border border-dashed border-[#b5c49a] bg-white/60 p-8 text-center text-[#727967]">
      Пока нет записей.
    </div>

    <div v-else class="space-y-4">
      <article
        v-for="post in posts"
        :id="postDomId(post)"
        :key="post.id"
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
            @click="openEdit(post)"
          />
          <UButton
            size="xs"
            variant="soft"
            color="error"
            icon="i-lucide-trash-2"
            label="Delete"
            class="rounded-full"
            @click="confirmDelete(post)"
          />
        </div>

        <p class="whitespace-pre-wrap text-xl leading-relaxed text-[#273026] md:text-2xl">
          {{ post.bodyText }}
        </p>

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
            @click="copyPostLink(post)"
          />
        </footer>
      </article>
    </div>

    <MicroblogPostForm v-model:open="formOpen" :post="editingPost" @saved="onSaved" />
  </section>
</template>

<script setup lang="ts">
import { DateTime } from 'luxon'

definePageMeta({
  contentWidth: 'wide',
})

interface MicroPost {
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
}

const { loggedIn } = useUserSession()
const toast = useToast()

const { data: posts, status, refresh } = useFetch<MicroPost[]>('/api/microblog')

const formOpen = ref(false)
const editingPost = ref<MicroPost | null>(null)

function postDomId(post: MicroPost) {
  return `post-${post.slug ?? post.id}`
}

function formatDate(date: string | null) {
  if (!date) return ''

  const dt = DateTime.fromISO(date).setLocale('ru')
  if (!dt.isValid) return ''

  const now = DateTime.now().setLocale('ru')
  if (dt.hasSame(now, 'day')) {
    return `сегодня, ${dt.toFormat('HH:mm')}`
  }

  if (dt.hasSame(now.minus({ days: 1 }), 'day')) {
    return `вчера, ${dt.toFormat('HH:mm')}`
  }

  return dt.toFormat('d LLLL yyyy, HH:mm')
}

function openNew() {
  editingPost.value = null
  formOpen.value = true
}

function openEdit(post: MicroPost) {
  editingPost.value = post
  formOpen.value = true
}

async function copyPostLink(post: MicroPost) {
  const url = new URL(window.location.href)
  url.hash = postDomId(post)

  try {
    await navigator.clipboard.writeText(url.toString())
    toast.add({ title: 'Ссылка скопирована', color: 'primary' })
  } catch {
    toast.add({ title: url.toString(), description: 'Скопируйте ссылку вручную', color: 'warning' })
  }
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
