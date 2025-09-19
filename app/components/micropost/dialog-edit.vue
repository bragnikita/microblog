<template>
  <div>
    <u-modal    
      v-model:open="dialog"
      :id="props.id"
      :width="'600px'"
      fullscreen
      :ui="{header: ''}"
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
            <u-button color="primary" size='xl' @click="onSubmit" :icon="'lucide:check'">Save</u-button>
            <u-button color="secondary" @click="close" size='xl'  :icon="'lucide:x'">Cancel</u-button>
          </div>
      </template>
    </u-modal>
  </div>
</template>

<script lang="ts" setup>
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
