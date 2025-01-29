<template>
  <div class="h-full flex flex-col">
    <div class="p-2 flex justify-end border-b border-gray-200 sticky top-0 bg-white z-10" v-if="loggedIn">
      <el-button type="primary" :icon="Plus" size="large" :tag="NuxtLink" to="/new">Add
        post</el-button>
    </div>
    <div class="text-center p-3" v-if="list.length === 0">
      <el-text type="info">No posts yet</el-text>
    </div>
    <div v-else class="grow flex flex-col gap-2 p-1">
      <div v-for="item in list" :key="item.id">
        <MicroPost :model="item">
          <template #actions v-if="loggedIn">
            <el-button :icon="EditPen" circle @click="() => navigateTo({ name: 'id-edit', params: { id: item.id } })" />
            <micropost-delete-btn :id="item.id" @deleted="refresh" />
          </template>
        </MicroPost>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Plus, EditPen, Delete } from "@element-plus/icons-vue";
import MicroPost from "~/components/micropost/MicroPost.vue";
import type { Model } from "~/components/micropost/model";
import { NuxtLink } from "#components";
const { loggedIn } = useUserSession();

const { data, refresh } = await useFetch('/api/microblog')

const list = computed(() => data.value?.list?.map(v => {
  return v satisfies Model
}) || [])
</script>
