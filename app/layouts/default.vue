<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui/runtime/components/NavigationMenu.vue.js'
import { computed } from 'vue'

const route = useRoute()
const contentWidth = computed(() => (route.meta as { contentWidth?: string }).contentWidth ?? 'default')

const widthClass = computed(() => {
  const value = contentWidth.value

  switch (value) {
    case 'narrow':
      return 'max-w-3xl'
    case 'compact':
      return 'max-w-xl'
    case 'wide':
      return 'max-w-6xl'
    case 'full':
      return 'max-w-none'
    default:
      return 'max-w-3xl'
  }
})

const contentStyle = computed(() => {
  const value = contentWidth.value

  if (typeof value === 'string' && /^[0-9]+px$/.test(value)) {
    return { maxWidth: value }
  }

  return undefined
})

const title = 'Haji no Tabi'
const description = 'Yet another personal microblog from one odd guy from Japan.'

const reqUrl = useRequestURL()
useSeoMeta({
  title,
  ogTitle: title,
  ogDescription: description,
  description,
  ogImage: computed(() => {
    const newUrl = new URL(reqUrl)
    newUrl.pathname = '/top-image.jpg'
    return newUrl.href
  }),
  ogLocale: 'ru_RU',
})

const { clear, loggedIn } = useUserSession()
const isLoggedIn = computed(() =>
  typeof loggedIn === 'object' && 'value' in loggedIn
    ? loggedIn.value
    : Boolean(loggedIn),
)

async function logout() {
  await clear()
  await navigateTo('/')
  useToast().add({ title: 'Logged out', color: 'primary' })
}

const heroMenuItems = [
  { label: 'Записи', to: '/microblog' },
  { label: 'Фотоальбомы', to: '', disabled: true },
  { label: 'Фоторепортажи', to: '', disabled: true },
  { label: 'Категории', to: '/categories' },
]

const primaryMenuItems = computed<NavigationMenuItem[][]>(() => [
  [
    { label: 'Microblog', icon: 'i-lucide-leaf', to: '/microblog' },
    { label: 'Photoalbums', icon: 'i-lucide-images', disabled: true },
    { label: 'Photoreports', icon: 'i-lucide-map', disabled: true },
    { label: 'Categories', icon: 'i-lucide-tags', to: '/categories' },
  ],
])

const drawerMenuItems = computed<NavigationMenuItem[][]>(() => {
  const items: NavigationMenuItem[][] = [
    ...primaryMenuItems.value,
  ]

  if (isLoggedIn.value) {
    items.push([
      {
        label: 'Logout',
        icon: 'i-lucide-log-out',
        class: 'text-error font-semibold',
        onSelect: logout,
      },
    ])
  }

  return items
})

function isActiveHeroItem(to: string) {
  return Boolean(to) && (route.path === to || route.path.startsWith(`${to}/`))
}
</script>

<template>
  <UMain class="min-h-screen bg-[#fbfaf4] text-[#273026]">
    <UHeader
    v-if="isLoggedIn"
      mode="drawer"
      toggle-side="right"
      class="!fixed inset-x-0 top-0 z-50 border-b border-[#ded6c4]/70 bg-[#fbfaf4]/70 shadow-none backdrop-blur-md"
      :toggle="{
        color: 'neutral',
        variant: 'soft',
        size: 'lg',
        class: 'rounded-2xl border border-[#3f6844]/15 bg-white/55 text-[#273026] shadow-none',
      }"

    >
      <template #left>
        <NuxtLink
          to="/"
          class="font-serif text-base text-[#273026]/70 no-underline"
        >
          Haji no Tabi
        </NuxtLink>
      </template>

      <template #body>
        <UNavigationMenu
          :items="drawerMenuItems"
          orientation="vertical"
          class="w-full"
        />
      </template>
    </UHeader>

    <div class="min-h-screen bg-[radial-gradient(circle_at_16%_12%,rgba(233,184,170,0.28),transparent_28rem),radial-gradient(circle_at_86%_4%,rgba(199,220,224,0.56),transparent_24rem),linear-gradient(110deg,#f8f5ea_0%,#fbfaf4_46%,#eef3e6_100%)]">
      <header class="relative overflow-hidden border-b border-[#ded6c4] bg-white/35">
        <div class="relative grid min-h-[260px] items-end overflow-hidden bg-[linear-gradient(90deg,rgba(39,48,38,0.74),rgba(39,48,38,0.22)_46%,rgba(251,250,244,0.5)),url('/top-image.jpg')] bg-cover bg-center p-6 pt-20 md:min-h-[430px] md:items-start md:p-9 md:pt-20">
          <div class="relative z-10 mx-auto grid w-full max-w-6xl gap-6 md:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] md:items-start">
            <div class="grid justify-items-start gap-5">
              <!-- <NuxtLink
                to="/"
                class="flex w-fit items-center gap-2 rounded-3xl border border-white/30 bg-[#161f15]/45 px-4 py-3 text-white no-underline shadow-2xl shadow-black/15 md:px-5 md:py-4"
                aria-label="На главную"
              >
                <span class="text-2xl leading-[0.99] md:text-5xl lg:text-6xl text-right">Hajiの</span>
                <span class="text-4xl uppercase tracking-[0.08em] md:text-4xl lg:text-5xl">旅</span>
              </NuxtLink> -->

              <div class="max-w-xl text-[#fffdf3] drop-shadow-[0_2px_20px_rgba(0,0,0,0.35)] md:max-w-[460px]">
                <p class="mb-2 font-sans text-xs font-bold uppercase tracking-[0.22em] text-white/75 md:text-[11px]">
                  личные заметки
                </p>
                <h1 class="max-w-[12ch] text-4xl font-medium leading-[0.95] md:max-w-none md:text-4xl lg:text-5xl">
                  Тихий микроблог о тропах, цветах и свете
                </h1>
              </div>
            </div>

            <div class="hidden justify-items-end md:grid">
              <nav
                class="w-full max-w-56 space-y-3"
                aria-label="Основная навигация"
              >
                <template v-for="item in heroMenuItems" :key="item.label">
                  <span
                    v-if="item.disabled"
                    class="block cursor-not-allowed rounded-full bg-[#5f6254]/60 px-7 py-3 text-center font-serif text-lg font-semibold text-[#fffdf3] opacity-80 shadow-lg shadow-black/10 backdrop-blur-md"
                  >
                    {{ item.label }}
                  </span>
                  <NuxtLink
                    v-else
                    :to="item.to"
                    class="block rounded-full bg-[#5f6254]/60 px-7 py-3 text-center font-serif text-lg font-semibold text-[#fffdf3] no-underline shadow-lg shadow-black/10 backdrop-blur-md transition hover:bg-[#5f6254]/75"
                  >
                    {{ item.label }}
                  </NuxtLink>
                </template>
              </nav>
            </div>
          </div>
        </div>

        <div class="border-t border-[#ded6c4]/70 bg-[#fbfaf4]/75 px-3 py-2 backdrop-blur md:hidden">
          <nav
            class="mx-auto grid max-w-3xl grid-cols-2 gap-2"
            aria-label="Основная навигация"
          >
            <template v-for="item in heroMenuItems" :key="item.label">
              <span
                v-if="item.disabled"
                class="cursor-not-allowed rounded-2xl border border-[#ded6c4] bg-white/50 px-3 py-2 text-center font-serif text-base font-semibold text-[#3f6844] opacity-60"
              >
                {{ item.label }}
              </span>
              <NuxtLink
                v-else
                :to="item.to"
                class="rounded-2xl border border-[#ded6c4] bg-white/50 px-3 py-2 text-center font-serif text-base font-semibold text-[#3f6844] no-underline transition hover:border-[#6f8e63]/50 hover:bg-[#eef3e6]"
                :class="isActiveHeroItem(item.to) ? 'border-[#6f8e63]/70 bg-[#eef3e6] text-[#273026] shadow-sm' : ''"
              >
                {{ item.label }}
              </NuxtLink>
            </template>
          </nav>
        </div>
      </header>

      <div :class="['mx-auto w-full px-3 py-4 md:px-6 md:py-7', widthClass]" :style="contentStyle">
        <slot />
      </div>
    </div>
  </UMain>
</template>
