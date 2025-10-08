<template>
  <div class="max-w-2xl mx-auto p-4">
    <div v-if="data">
      <MicropostView :model="data" />
    </div>
    <div v-else class="text-center text-gray-500">Loading...</div>
  </div>
</template>

<script lang="ts" setup>

const { data } = useFetch(`/api/microblog/public/${useRoute().params.id}`, {
  immediate: true,
  onResponse({ response }) {
    console.log('Fetched micropost data:', response._data);
  },
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
      reactiveTags.title = newData.content.title || "Haji no tabi";
      reactiveTags.description =
        (newData.content.text + '???') ||
        "Yet another personal microblog from one odd guy from Japan.";
      reactiveTags.image = newData.content.images?.[0]?.thumbnailUrl || null;
    }
  },
  { immediate: true }
);

const seoTitle = computed(() => data.value?.content?.title || 'Haji no tabi')
const seoDescription = computed(() => data.value?.content?.text || 'Yet another personal microblog from one odd guy from Japan.')
const seoImage = computed(() => data.value?.content?.images?.[0]?.thumbnailUrl || null)

useSeoMeta({
  title: seoTitle,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogImage: seoImage,  
  ogLocale: "ru_RU",
});

</script>
