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
    <div class="px-1 pt-2 pb-1">
        <MicroPost :model="data" v-if="data" />
    </div>
</template>
