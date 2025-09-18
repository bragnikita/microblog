<template>
  <div class="inline-block">
    <u-modal
      v-model:open="dialog"
      :id="props.id"
      :width="'600px'"
      title="Edit Micropost"
    >
      <u-button
        :icon="props.buttonIcon || 'lucide:edit-2'"
        size="sm"
        @click="dialog = true"
      />
      <template #body>
        <micropost-form-edit v-model="form" />
        <div class="flex justify-end gap-2 mt-6">
          <u-button color="neutral" @click="onCancel">Cancel</u-button>
          <u-button color="primary" @click="onSubmit">Submit</u-button>
        </div>
      </template>
    </u-modal>
  </div>
</template>

<script lang="ts" setup>
import { emit } from 'process';
import type { Model } from './model';


const props = defineProps<{
  id: string;
  model: Model;
  buttonIcon?: string;
}>();

const dialog = ref(false);

const emits = defineEmits<{
  (e: 'updated'): void;
}>();

const form = ref({
  title: props.model.title || "",
  text: props.model.text || "",
  images:
    props.model.images?.map((img: any) => ({
      id: img.key,
      previewUrl: img.thumbnailUrl,
    })) || [],
  videoId: props.model.video?.youtubeId || "",
  isPublic: true,
});

function onSubmit() {
  console.log("Micropost edit submit:", form.value);
  $fetch(`/api/microblog/${props.id}`, {
    method: "PUT",
    body: {
      text: form.value.text,
      title: form.value.title,
      images: form.value.images.map((img: any) => ({ key: img.id })),
      video: form.value.videoId
        ? { youtubeId: form.value.videoId }
        : undefined,
    },
  })
    .then((res) => {
      console.log("Micropost updated:", res);
      // Close dialog
      dialog.value = false;
      emits('updated');
    })
    .catch((err) => {
      console.error("Error updating micropost:", err);
      alert("Error updating micropost. See console for details.");
    });
}

function onCancel() {
  dialog.value = false;
}
</script>
