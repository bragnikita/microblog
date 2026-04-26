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
      { label: "Microblog", to: "/microblog" },
      { label: "Photos", to: "/photos/recent" },
      { label: "Categories", to: "/categories" },
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
