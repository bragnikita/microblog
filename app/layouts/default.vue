<script setup lang="ts">
import { NuxtLink,  } from "#components";
import { isDevMode } from "#shared/utils";
import { computed } from 'vue'

// The page can set `definePageMeta({ contentWidth: 'wide' })` or a pixel string
// e.g. `definePageMeta({ contentWidth: '800px' })`. We read this value from
// `route.meta.contentWidth` and compute a CSS class used on the container.
const route = useRoute()
const contentWidth = computed(() => (route.meta as any).contentWidth ?? 'default')

const widthClass = computed(() => {
  const v = contentWidth.value
  switch (v) {
    case 'narrow':
      return 'md:w-[600px]'
    case 'compact':
      return 'md:w-[480px]'
    case 'wide':
      return 'md:w-[900px]'
    case 'full':
      return 'md:w-full max-w-none'
    default:
      // accept custom pixel value like '700px' or arbitrary class
      if (typeof v === 'string' && /^[0-9]+px$/.test(v)) {
        return `md:w-[${v}]`
      }
      return 'md:w-[600px]'
  }
})

const title = "Haji no Tabi";
const description =
  "Yet another personal microblog from one odd guy from Japan.";

const reqUrl = useRequestURL();
useSeoMeta({
  title,
  ogTitle: title,
  ogDescription: description,
  description,
  ogImage: computed(() => {
    const newUrl = new URL(reqUrl);
    newUrl.pathname = "/top-image.jpg";
    return newUrl.href;
  }),
  ogLocale: "ru_RU",
});

const { clear, loggedIn } = useUserSession();
async function logout() {
  await clear();
  await navigateTo("/");
}

const mainMenu = ref(false);
</script>

<template>
  <MainDefaultHeader v-if="loggedIn"/>
<UMain>
  <div class="h-full flex flex-col">
    <div class="relative h-[150px] md:h-[300px] md:mb-[-40px]">
      <div class="absolute">
        <NuxtLink
        to="/"
        class="flex justify-start items-start bg-black/50 text-white gap-2 p-2"
        >
        <div class="text-5xl md:text-7xl">Haji<br />の</div>
        <div class="text-4xl md:text-7xl">旅<br />旅</div>
      </NuxtLink>
    </div>
    <div class="absolute top-1 right-1" v-if="loggedIn">
      <!-- <el-button circle :icon="SwitchButton" @click="logout" size="large" type="danger" /> -->
    </div>
    <img
    src="/top-image.jpg"
    class="h-full w-full object-cover object-center"
    />
  </div>
  <div :class="['grow mx-auto w-full relative', widthClass]">
    <div class="">
      <div class="shadow-md bg-white md:rounded-md min-h-[200px]">
        <div
        v-if="isDevMode()"
        class="flex justify-start items-center gap-2 p-2"
        >
        <!-- <el-button type="default" plain :icon="Menu" @click="() => {mainMenu = true}"/> -->
          <!-- <el-divider direction="vertical" /> -->
          
        </div>
        <UContainer>
          <slot />
        </UContainer>
      </div>
    </div>
  </div>
</div>

</UMain>
</template>
