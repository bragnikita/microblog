<template>
  <div>
    <u-modal
      v-model:open="dialog"
      :id="props.id"
      :width="'600px'"
      fullscreen
      :ui="{ header: '' }"
    >
      <u-button
        :icon="props.buttonIcon || 'lucide:edit-2'"
        size="md"
        @click="dialog = true"
      />
      <template #body>
        <micropost-form-edit v-model="form" />
      </template>
      <template #header="{ close }">
        <div class="flex justify-between w-full">
          <u-button
            color="primary"
            size="xl"
            @click="() => onSubmit(isDraft)"
            :icon="'lucide:check'"
            >{{  isDraft ? 'Save draft' : 'Save' }}</u-button
          >
          <u-button
            color="warning"
            size="xl"
            @click="() => onSubmit(false)"
            :icon="'lucide:globe'"
            v-if="isDraft"
            >Publish</u-button
          >
          <u-button
            color="secondary"
            @click="close"
            size="xl"
            :icon="'lucide:x'"
            >Cancel</u-button
          >
        </div>
      </template>
    </u-modal>
  </div>
</template>

<script lang="ts" setup>
import type { Model } from "./model";

const props = defineProps<{
  id: string;
  buttonIcon?: string;
}>();

const model = ref<Model | null>(null);

const dialog = ref(false);

const emits = defineEmits<{
  (e: "updated"): void;
}>();

const isDraft = computed(() => model.value?.visibility === "draft");

const form = ref({
  title: "",
  text: "",
  images: [] as { id: string; previewUrl: string }[],
  videoId: "",
  isPublic: true,
});

function onSubmit(isDraft: boolean = false) {
  console.log("Micropost edit submit:", form.value);
  $fetch(`/api/microblog/private/${props.id}`, {
    method: "PUT",
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
      console.log("Micropost updated:", res);
      // Close dialog
      dialog.value = false;
      emits("updated");
    })
    .catch((err) => {
      console.error("Error updating micropost:", err);
      alert("Error updating micropost. See console for details.");
    });
}

function onCancel() {
  dialog.value = false;
}

watch(
  () => props.id,
  async (newId) => {
    if (newId) {
      model.value = await $fetch<Model>(`/api/microblog/private/${newId}`);
      form.value = {
        title: model.value.content.title || "",
        text: model.value.content.text || "",
        images:
          model.value.content.images?.map((img: any) => ({
            id: img.id,
            previewUrl: img.thumbnailUrl,
          })) || [],
        videoId: model.value.content.video?.youtubeId || "",
        isPublic: model.value.visibility === "public",
      };
    }
  },
  { immediate: true }
);
</script>
