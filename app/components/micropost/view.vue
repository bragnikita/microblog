<template>
  <div class="space-y-4 ">
    <!-- Title -->
    <div class="flex items-center gap-2">
      <h2 class="text-xl font-bold">{{ props.model.title }}</h2>
    </div>

    <!-- Text -->
    <div v-if="props.model.text" class="text-gray-800 whitespace-pre-line">
      {{ props.model.text }}
    </div>

    <!-- Images -->
    <div
    v-if="props.model.images && props.model.images.length"
      class="flex flex-wrap gap-3"
    >
      <img
        v-for="img in props.model.images"
        :key="img.key"
        :src="img.thumbnailUrl"
        class="w-40 h-40 object-cover rounded border border-gray-200"
        alt="Micropost image"
      />
    </div>
    <!-- Video -->
     <div v-if="props.model.video?.youtubeId" class="mb-4">
       <Preview :id="props.model.video.youtubeId" />
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
