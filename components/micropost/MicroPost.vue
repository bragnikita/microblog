<template>
  <div class="flex flex-col gap-1">
    <div class="flex justify-between items-center gap-2">
      <div class="flex items-center grow">
        <slot name="actions" />
      </div>
      <div class="text-sm font-semibold text-gray-400">
        <ClientOnly>
          {{ daytimes.micropost(model.timestamp) }}
        </ClientOnly>
      </div>
    </div>
    <div class="px-2 font-bold" v-if="model.title">{{ model.title }}</div>
    <div class="px-2">{{ model.text }}</div>
    <div v-if="model.images" class="flex gap-1">
      <a
        class="block w-1/2 h-1/4 min-h-[100px] cursor-pointer"
        @click="() => show(i)"
        v-for="(image, i) in model.images"
        :key="image.key"
      >
        <el-image
          :src="image.thumbnailUrl"
          lazy
          fit="cover"
          class="aspect-[3/2] border border-gray-300 rounded-md"
        />
      </a>
    </div>
    <div v-if="model.video?.youtubeId">
      <video-preview :id="model.video.youtubeId" class="" />
    </div>
    <vue-easy-lightbox @hide="onHide" :index="indexRef" :imgs="imgsRef" :visible="visibleRef" />
  </div>
</template>

<script lang="ts" setup>
import { ClientOnly } from "#components";
import type { Model } from "~/components/micropost/model";
import { daytimes } from "~/shared/formatters";
import VueEasyLightbox, { useEasyLightbox } from "vue-easy-lightbox";

type Props = {
  model: Model;
};

const props = defineProps<Props>();
const preview = computed(() =>
  props.model.images?.map((v) => {
    return v.originalUrl;
  })
);

const { show, imgsRef, indexRef, onHide, visibleRef } = useEasyLightbox({
  imgs: preview.value || [],
  initIndex: 0,
});
</script>
