<script setup lang="ts">
import MicroPost from "~/components/micropost/MicroPost.vue";
import type { Model } from "~/components/micropost/model";
const route = useRoute();
const { data } = await useFetch<Model>("/api/microblog/" + route.params.id);
import { daytimes } from "~/shared/formatters";
useSeoMeta({
  title: data.value?.title,
  ogTitle: data.value?.title,
  description: data.value?.text,
  ogDescription: data.value?.text,
  ogImage: data.value?.images?.[0]?.thumbnailUrl,
});

const { loggedIn } = useUserSession();
</script>

<template>
  <div class="px-2 pt-2 pb-2 flex flex-col">
    <MicroPost :model="data" v-if="data" />
    <div class="text-sm font-semibold text-gray-400 flex justify-end" v-if="data">
      <ClientOnly>
        {{ daytimes.micropost(data.timestamp) }}
      </ClientOnly>
    </div>
    <div class="flex justify-between mt-2">
      <el-button
        @click="navigateTo({ name: 'microblog' })"
        plain
        type="primary"
        class="grow"
        >To list</el-button
      >
      <el-button
        @click="
          navigateTo({
            name: 'microblog-id-edit',
            params: { id: route.params.id },
          })
        "
        class="grow"
        plain
        type="warning"
        v-if="loggedIn"
      >
        Edit
      </el-button>
    </div>
  </div>
</template>
