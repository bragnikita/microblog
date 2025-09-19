<template>
  <div class="max-w-xl mx-auto space-y-6">
    <MicropostFormEdit v-model="form" />
    <div class="flex justify-between">
      <u-button color="primary" size="xl" @click="onSubmit" :icon="'lucide:save'">Save</u-button>
      <u-button color="secondary" @click="onReturn" size="xl" :icon="'lucide:arrow-left'">Return</u-button>
    </div>
    <div class="mt-4 whitespace-pre font-mono text-sm bg-gray-100 p-4 rounded">
      {{ JSON.stringify(form, null, 2) }}
    </div>
  </div>
</template>
<script setup lang="ts">

import { ref } from "vue";
import MicropostFormEdit from "~/components/micropost/form-edit.vue";

definePageMeta({
  layout: "clear",
});

const form = ref({
  title: "",
  text: "",
  images: [],
  videoId: "",
  isPublic: true,
});

function onSubmit() {
  $fetch(`/api/microblog`, {
    method: "POST",
    body: {
      text: form.value.text,
      title: form.value.title,
      images: form.value.images.map((img: any) => ({ key: img.id })),
      video: form.value.videoId ? { youtubeId: form.value.videoId } : undefined,
    },
  })
    .then((res) => {
      console.log("Post created:", res);
      navigateTo("/microblog");
    })
    .catch((err) => {
      console.error("Error creating post:", err);
      alert("Error creating post. See console for details.");
    });
}

function onReturn() {
        navigateTo("/microblog");
}
</script>
