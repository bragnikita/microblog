<template>
  <div class="h-full flex flex-col">
    <div class="p-2 flex justify-end border-b border-gray-200">
      <el-button type="primary" :icon="Plus" @click="() => refresh()" size="large">Add post</el-button>
    </div>
    <div class="text-center p-3" v-if="list.length === 0">
      <el-text type="info">No posts yet</el-text>
    </div>
    <div v-else class="grow flex flex-col gap-2 p-1">
    <div v-for="item in list" :key="item.id">
      <MicroPost :model="item"/>
    </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {Plus, Delete} from "@element-plus/icons-vue";
import MicroPost from "~/components/micropost/MicroPost.vue";
import type {Model} from "~/components/micropost/model";

const {data, refresh} = await useFetch('/api/microblog')

const list = computed(() => data.value?.list?.map(v => {
  return {
    text: v.text || '',
    timestamp: v.timestamp,
    images: [],
    video: undefined,
    id: v.id,
  } satisfies Model
}) || [])
</script>
