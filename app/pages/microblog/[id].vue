<template>
  <div class="max-w-2xl mx-auto p-4">
    <div v-if="data">
      <MicropostView :model="data" />
    </div>
    <div v-else class="text-center text-gray-500">Loading...</div>
  </div>
</template>

<script lang="ts" setup>
import type { Model } from "./../../components/micropost/model";

const { data } = useFetch(`/api/microblog/${useRoute().params.id}`, {
  immediate: true,
});

const reactiveTags = reactive({
  title: "!Haji no tabi",
  description: null as string | null,
  image: null as string | null,
});

watch(
  data,
  (newData) => {
    if (newData) {
      reactiveTags.title = newData.title || "Haji no tabi";
      reactiveTags.description =
        (newData.text + '???') ||
        "Yet another personal microblog from one odd guy from Japan.";
      reactiveTags.image = newData.images?.[0]?.thumbnailUrl || null;
    }
  },
  { immediate: true }
);

const seoTitle = computed(() => data.value?.title || 'Haji no tabi')
const seoDescription = computed(() => data.value?.text || 'Yet another personal microblog from one odd guy from Japan.')
const seoImage = computed(() => data.value?.images?.[0]?.thumbnailUrl || null)

useSeoMeta({
  title: seoTitle,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogImage: seoImage,  
  ogLocale: "ru_RU",
});

</script>
