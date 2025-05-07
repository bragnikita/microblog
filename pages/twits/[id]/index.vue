<script setup lang="ts">
import MicroPost from '~/components/micropost/MicroPost.vue';
import type { Model } from '~/components/micropost/model';
const route = useRoute();
const { data } = await useFetch<Model>('/api/microblog/' + route.params.id);

useSeoMeta({
    description: data.value?.text,
    ogDescription: data.value?.text,
    ogImage: data.value?.images?.[0]?.thumbnailUrl
})
</script>

<template>
    <div class="px-1 pt-2 pb-2 flex flex-col gap-2">
        <MicroPost :model="data" v-if="data" />
        <div class="grid grid-cols-2">
            <el-button @click="navigateTo({name: 'twits'})" plain type="primary">To list</el-button>
            <el-button @click="navigateTo({name: 'twits-id-edit', params: { id: route.params.id }})" plain type="warning">Edit</el-button>
        </div>
    </div>
</template>
