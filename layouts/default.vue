<script setup lang="ts">
import { NuxtLink } from '#components';
import { Menu, SwitchButton } from "@element-plus/icons-vue";
import { isDevMode } from '~/shared/utils';

const title = 'Haji no Tabi';
const description = 'Yet another personal microblog from one odd guy from Japan.';
const config = useRuntimeConfig()
useSeoMeta({
  title,
  ogTitle: title,
  ogDescription: description,
  description,
  ogImage: config.public.baseUrl + '/top-image.jpg',
  ogLocale: 'ru_RU',
})

const { clear, loggedIn } = useUserSession();
async function logout() {
  await clear();
  await navigateTo('/')
}

const mainMenu = ref(false);
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="relative h-[150px] md:h-[300px]">
      <div class="absolute">
        <NuxtLink to="/" class='flex justify-start items-start bg-black bg-opacity-40 text-white gap-2 p-2'>
          <div class='text-5xl md:text-7xl'>Haji<br />の</div>
          <div class='text-4xl md:text-7xl'>旅<br />旅</div>
        </NuxtLink>
      </div>
      <div class="absolute top-1 right-1" v-if="loggedIn">
        <el-button circle :icon="SwitchButton" @click="logout" size="large" type="danger" />
      </div>
      <img src="/top-image.jpg" class="h-full w-full object-cover object-center " />
    </div>
    <div class="grow mx-auto w-full md:w-[600px] relative">
      <div class="absolute top-0 md:top-[-50px] right-0 left-0 bottom-0">
        <div class="shadow-md bg-white md:rounded-md  min-h-[200px]">
            <div v-if="isDevMode()" class="flex justify-start items-center gap-2 p-2">
            <el-button type="default" plain :icon="Menu" @click="() => {mainMenu = true}"/>
            <el-divider direction="vertical" />
            <NuxtLink to="/blog" class="text-lg font-semibold text-gray-700" active-class="underline">
              Блог
            </NuxtLink>
            <el-divider direction="vertical" />
            <NuxtLink to="/twits" class="text-lg font-semibold text-gray-700" active-class="underline">
              Поток мыслей
            </NuxtLink>
            </div>
          <slot />
        </div>
      </div>
    </div>
    <el-drawer direction="ltr"
      v-model="mainMenu"
      :close-on-click-modal="true"
      :close-on-press-escape="true"
      :show-close="true"
      >
      <template #default>
        Menu
      </template>
      </el-drawer>
  </div>
</template>