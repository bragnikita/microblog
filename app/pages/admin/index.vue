<script setup lang="ts">
definePageMeta({ middleware: 'authenticated' })

const links = [
  { label: 'Категории', description: 'Управление категориями записей', to: '/admin/categories', icon: 'i-lucide-tags' },
  { label: 'Фото (последние)', description: 'Последние загруженные фотографии', to: '/admin/photos/recent', icon: 'i-lucide-images' },
  { label: 'Черновики', description: 'Микропосты в статусе черновика', to: '/admin/drafts', icon: 'i-lucide-file-pen-line' },
  { label: 'Приватные записи', description: 'Записи с приватным доступом', to: '/admin/private', icon: 'i-lucide-lock' },
  { label: 'Debug', description: 'Диагностика соединений', to: '/admin/debug', icon: 'i-lucide-terminal' },
]
</script>

<template>
  <section class="mx-auto max-w-3xl">
    <div class="mb-6 rounded-[1.25rem] border border-[#ded6c4] bg-white/70 p-5 shadow-[0_10px_30px_rgba(80,72,54,0.07)] backdrop-blur">
      <p class="mb-1 font-sans text-xs font-bold uppercase tracking-[0.2em] text-[#3f6844]">
        Панель управления
      </p>
      <h1 class="text-3xl font-medium text-[#273026]">
        Администрирование
      </h1>
    </div>

    <div class="grid gap-3 sm:grid-cols-2">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="flex items-start gap-4 rounded-[1.25rem] border border-[#ded6c4] bg-[#fffdf7]/85 p-5 no-underline shadow-[0_4px_16px_rgba(80,72,54,0.06)] transition hover:border-[#6f8e63]/50 hover:bg-[#eef3e6]/60"
      >
        <div class="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#eef3e6] text-[#3f6844]">
          <UIcon :name="link.icon" class="size-5" />
        </div>
        <div>
          <p class="font-semibold text-[#273026]">
            {{ link.label }}
          </p>
          <p class="mt-0.5 text-sm text-[#727967]">
            {{ link.description }}
          </p>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>
