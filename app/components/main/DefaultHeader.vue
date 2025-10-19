<template>
  <UHeader mode="drawer" toggle-side="right">
    <UNavigationMenu :items="items" />
    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" />
    </template>
  </UHeader>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui/runtime/components/NavigationMenu.vue.js";
import { computed } from "vue";
const { clear, loggedIn, ready, fetch : fetchSession } = useUserSession();
const isLoggedIn = computed(() =>
  typeof loggedIn === "object" && "value" in loggedIn
    ? loggedIn.value
    : !!loggedIn
);
async function logout() {
  await clear();
  await navigateTo("/");
  useToast().add({ title: "Logged out", color: "primary" });
}

const items = computed<NavigationMenuItem[]>(() => {
  const baseItems: NavigationMenuItem[][] = [
    [
      //   { label: "Home", to: "/" },
      {
        label: "Microblog " + (ready.value ? 'ready': 'not ready') + ',' + (isLoggedIn.value ? 'logged in' : 'not logged in'),
        children: [
          { label: "Public", to: "/microblog" },
          { label: "Private", to: "/microblog/private" },
          { label: "Drafts", to: "/microblog/drafts" },
          {
            label: "Add micropost",
            to: "/microblog/new",
            icon: "lucide:circle-plus",
            class: "text-primary font-bold",
          },
        ],
      },
      { label: "Books", to: "/" },
      { label: "Gallery", to: "/" },
      { label: "About", to: "/" },
      { label: 'Refresh session', onClick: async () => {
        await fetchSession();
        useToast().add({ title: "Session refreshed", color: "primary" });
      } }
    ],
  ];
  if (isLoggedIn.value) {
    baseItems.push([
      {
        label: "Logout",
        onClick: logout,
        class: "text-secondary font-bold",
        icon: "lucide:log-out",
      },
    ]);
    baseItems.push([]);
  }
  return baseItems;
});
</script>
