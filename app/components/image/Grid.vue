<template>
  <div class="grid gap-1 grid-cols-2" ref="gridRef">
    <a
      :class="`block ${
        isFullColumnImage(i) ? 'col-span-2' : 'col-span-1'
      } min-h-[100px] cursor-pointer`"
      @click="() => show(i)"
      v-for="(image, i) in images"
      :key="image.id"
    >
      <lazy-image
        :parentRef="gridRef"
        :imageUrl="image.thumbnailUrl"
      />
    </a>
    <vue-easy-lightbox
      @hide="onHide"
      :index="indexRef"
      :imgs="imgsRef"
      :visible="visibleRef"
      :scrollDisabled="false"
      loop
      :zoomScale="0.5"
    />
  </div>
</template>
<script setup lang="ts">
import type { PropType } from "vue";
import VueEasyLightbox, { useEasyLightbox } from "vue-easy-lightbox";
import LazyImage from "~/components/image/LazyImage.vue";

const props = defineProps({
  images: {
    type: Object as PropType<
      {
        id: string;
        thumbnailUrl: string;
        originalUrl?: string;
        compressedUrl: string;
      }[]
    >,
    required: true,
  },
});

const preview = computed(() =>
  props.images?.map((v) => {
    return v.compressedUrl || v.originalUrl!;
  })
);

const { show, imgsRef, indexRef, onHide, visibleRef } = useEasyLightbox({
  imgs: preview.value || [],
  initIndex: 0,
});

const isFullColumnImage = (index: number) => {
  return props.images.length % 2 === 1 && index === 0;
};

const gridRef = ref<HTMLElement | null>(null);
</script>
