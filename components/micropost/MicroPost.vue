<template>
  <div class="flex flex-col gap-1">
    <div class="flex justify-between items-center gap-2">
      <div class="flex items-center grow">
        <slot name="actions" />
      </div>
    </div>
    <div class="px-2 font-bold" v-if="model.title">{{ model.title }}</div>
    <div class="px-2">{{ model.text }}</div>
    <ImageGrid v-if="model.images"
      :images="model.images"
      />
    <div v-if="model.video?.youtubeId">
      <video-preview :id="model.video.youtubeId" class="" />
    </div>
    <vue-easy-lightbox @hide="onHide" :index="indexRef" :imgs="imgsRef" :visible="visibleRef" loop :zoomScale="0.5"/>
  </div>
</template>

<script lang="ts" setup>
import { ClientOnly, ImageGrid } from "#components";
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
