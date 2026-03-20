<template>
  <div class="max-w-xl mx-auto space-y-6">
    <MicropostFormEdit v-model="form" />
    <div class="flex justify-between">
      <u-button
        color="primary"
        size="xl"
        @click="() => onSubmit(false)"
        :icon="'lucide:save'"
        >Save</u-button
      >
      <div class="flex gap-x-1">
        <u-button
          color="info"
          size="xl"
          @click="() => onSubmit(true)"
          :icon="'lucide:drafting-compass'"
          >Save as Draft</u-button
        >
        <u-button
          color="secondary"
          @click="onReturn"
          size="xl"
          :icon="'lucide:arrow-left'"
          >Return</u-button
        >
      </div>
    </div>
    <div class="mt-4 whitespace-pre font-mono text-sm bg-gray-100 p-4 rounded overflow-scroll">
      {{ JSON.stringify(form, null, 2) }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import MicropostFormEdit from "~/components/micropost/form-edit.vue";

definePageMeta({
  layout: "clear",
  contentWidth: 'default',
});

const form = ref({
  title: "",
  text: "",
  images: [],
  videoId: "",
  isPublic: true,
});

const nav = useRequestURL();
const backUrl = computed(() => {
  return nav.searchParams.get("back") || "/microblog";
});

function onSubmit(isDraft: boolean = false) {
  $fetch(`/api/microblog/private`, {
    method: "POST",
    body: {
      text: form.value.text,
      title: form.value.title,
      images: form.value.images.map((img: any) => ({ id: img.id })),
      video: form.value.videoId ? { youtubeId: form.value.videoId } : undefined,
      visibility: isDraft
        ? "draft"
        : form.value.isPublic
        ? "public"
        : "private",
    },
  })
    .then((res) => {
      console.log("Post created:", res);
      navigateTo(backUrl.value);
    })
    .catch((err) => {
      console.error("Error creating post:", err);
      alert("Error creating post. See console for details.");
    });
}

function onReturn() {
  navigateTo(backUrl.value);
}
</script>
