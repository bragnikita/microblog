<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui/runtime/components/NavigationMenu.vue.js'

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

const primaryMenuItems = computed<NavigationMenuItem[][]>(() => [
  [
    { label: 'Microblog', icon: 'i-lucide-leaf', to: '/microblog' },
    { label: 'Photoalbums', icon: 'i-lucide-images', to: '/albums' },
    { label: 'Photoreports', icon: 'i-lucide-map', disabled: true },
    { label: 'Categories', icon: 'i-lucide-tags', to: '/categories' },
  ],
])

const adminMenuItems = computed<NavigationMenuItem[]>(() => [
  { label: 'Admin', icon: 'i-lucide-layout-dashboard', to: '/admin' },
  { label: 'Categories editor', icon: 'i-lucide-tags', to: '/admin/categories' },
  { label: 'Recent photos', icon: 'i-lucide-images', to: '/admin/photos/recent' },
  { label: 'Drafts', icon: 'i-lucide-file-pen-line', to: '/admin/drafts' },
  { label: 'Private posts', icon: 'i-lucide-lock', to: '/admin/private' },
])

// Focus first item in drawer when opened 
// (UX improvement for keyboard users and preventing warning about no focusable element in drawer)
const drawerOpen = ref(false)
const drawerMenuRef = ref<HTMLElement | null>(null)

watch(drawerOpen, (open) => {
  if (open) {
    nextTick(() => {
      const first = drawerMenuRef.value?.querySelector<HTMLElement>('a, button')
      first?.focus()
    })
  }
})

const drawerMenuItems = computed<NavigationMenuItem[][]>(() => [
  ...primaryMenuItems.value,
  adminMenuItems.value,
  [
    {
      label: 'Logout',
      icon: 'i-lucide-log-out',
      class: 'text-error font-semibold',
      onSelect: logout,
    },
  ],
])
</script>

<template>
  <UHeader
    v-if="isLoggedIn"
    v-model:open="drawerOpen"
    mode="drawer"
    toggle-side="right"
    class="fixed! inset-x-0 top-0 z-50 border-b border-[#ded6c4]/70 bg-[#fbfaf4]/70 shadow-none backdrop-blur-md"
    :toggle="{
      color: 'neutral',
      variant: 'soft',
      size: 'lg',
      class: 'rounded-2xl border border-[#3f6844]/15 bg-white/55 text-[#273026] shadow-none',
    }"
  >
    <template #left>
      <NuxtLink
        to="/admin"
        class="text-base text-[#273026]/70 no-underline"
      >
        Blog admin mode
      </NuxtLink>
    </template>

    <template #body>
      <div ref="drawerMenuRef">
        <UNavigationMenu
          :items="drawerMenuItems"
          orientation="vertical"
          class="w-full"
        />
      </div>
    </template>
  </UHeader>
  <div style="height: 63px;" v-if="isLoggedIn"></div>
</template>
