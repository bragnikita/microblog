<template>
  <div class="space-y-4">
    <!-- Title -->
    <div>
      <label class="block text-sm font-medium mb-1" for="micropost-title"
        >Title</label
      >
      <UInput
        id="micropost-title"
        v-model="model.title"
        placeholder="Enter title..."
        autocomplete="off"
        class="w-full"
      />
    </div>

    <!-- Text (autogrow) -->
    <div>
      <label class="block text-sm font-medium mb-1" for="micropost-text"
        >Text</label
      >
      <UTextarea
        id="micropost-text"
        v-model="model.text"
		:autoresize="true"
        placeholder="What's on your mind?"
        class="w-full"
      />
    </div>

    <!-- Images -->
    <div>
      <label class="block text-sm font-medium mb-1">Images</label>
      <CollEditor v-model="imageIds" />
    </div>

	<div>
		<label class="block text-sm font-medium mb-1">Videos</label>
		<video-youtube-input v-model="model.videoId" />
	</div>

    <!-- Public/Private Switch -->
    <div class="flex items-center gap-2">
      <label class="text-sm font-medium">Public</label>
      <USwitch v-model="model.isPublic" color="primary" class="w-10" />
      <span class="text-xs text-gray-500"
        >({{ model.isPublic ? "Visible to everyone" : "Private" }})</span
      >
    </div>
  </div>
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
  get: () => model.value.images.map((img) => img.id),
  set: (ids: string[]) => {
    // Remove images not in ids
    model.value.images = ids.map(id => ({id} as ImageItem))
  },
});
</script>
