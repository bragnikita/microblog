<template>
  <div class="space-y-4">
    <!-- Title -->
    <div class="flex items-center gap-2">
      <h2 class="text-xl font-bold">{{ props.model.content.title }}</h2>
    </div>

    <!-- Text -->
    <div v-if="props.model.content.text" class="text-gray-800 whitespace-pre-line">
      {{ props.model.content.text }}
    </div>

    <!-- Images -->
    <image-grid
      v-if="props.model.content.images && props.model.content.images.length"
      :images="props.model.content.images"
    />
    <!-- Video -->
    <div v-if="props.model.content.video?.youtubeId" class="mb-4">
      <Preview :id="props.model.content.video.youtubeId" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import Preview from "../video/Preview.vue";
import type { Model } from "./model";

const props = defineProps<{
  model: Model;
}>();
</script>
