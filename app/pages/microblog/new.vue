<template>
  <div class="max-w-xl mx-auto py-8 space-y-6">
    <MicropostFormEdit v-model="form" />
    <button
      class="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
      @click="onSubmit"
    >
      Submit
    </button>
    <button
      type="button"
      class="ml-2 px-4 py-2 rounded bg-gray-300 text-gray-800 font-semibold hover:bg-gray-400 transition"
      @click="onReset"
    >
      Reset
    </button>
    <div class="mt-4 whitespace-pre font-mono text-sm bg-gray-100 p-4 rounded">
      {{ JSON.stringify(form, null, 2) }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import MicropostFormEdit from "~/components/micropost/form-edit.vue";

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
      onReset();
      navigateTo("/microblog");
    })
    .catch((err) => {
      console.error("Error creating post:", err);
      alert("Error creating post. See console for details.");
    });
}

function onReset() {
  form.value = {
    title: "",
    text: "",
    videoId: "",
    images: [],
    isPublic: true,
  };
}
</script>
