<template>
  <UForm class="space-y-2" :state="model" >
    <UTextarea
        id="micropost-text"
        v-model="model.text"
		    :autoresize="true"
        placeholder="What's on your mind?"
        class="w-full"
        :rows="5"
        size="xl"
        ref="textField"
    />
    <CollEditor v-model="imageIds" />

    <UInput
        id="micropost-title"
        v-model="model.title"
        placeholder="Enter title..."
        autocomplete="off"
        class="w-full"
        size="xl"
    />

		<video-youtube-input v-model="model.videoId" />
    <USeparator />
    <div class="flex items-center gap-2 mt-5">
      <label class="text-sm font-medium">Public</label>
      <USwitch v-model="model.isPublic" color="primary" class="w-10" size="xl" />
      <span class="text-xs text-gray-500"
        >({{ model.isPublic ? "Visible to everyone" : "Private" }})</span
      >
    </div>
  </UForm>

</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import CollEditor from "../photo/CollEditor.vue";

interface ImageItem {
  id: string;
  previewUrl?: string;
  processing?: boolean;
}

const model = defineModel<{
  title: string;
  text: string;
  images: ImageItem[];
  videoId?: string;
  isPublic: boolean;
}>({
  required: true,
});

// Computed for CollEditor (expects string[] of IDs)
const imageIds = computed({
  get: () => model.value.images,
  set: (ids: ImageItem[]) => {
    // Remove images not in ids
    model.value.images = ids
  },
});

// Text input 
const textField = useTemplateRef('textField')

onMounted(() => {
  if (textField.value) {
        const isSmallScreen = window.matchMedia("(max-width: 640px)").matches;
        if (!isSmallScreen) {
          textField.value?.textareaRef?.focus();
        }
    }
})
</script>
