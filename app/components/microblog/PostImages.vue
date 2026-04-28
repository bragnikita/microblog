<template>
  <div v-if="images?.[0]" class="mt-3">
    <!-- Odd count: first image full width, rest in 2 columns -->
    <template v-if="isOdd">
      <img
        :src="images[0].thumbnailUrl"
        :alt="`Image ${images[0].id}`"
        class="w-full cursor-pointer rounded-lg object-cover aspect-4/3"
        loading="lazy"
        @click="openLightbox(0)"
      />
      <div v-if="rest.length" class="mt-1 grid grid-cols-2 gap-1">
        <img
          v-for="(img, i) in rest"
          :key="img.id"
          :src="img.thumbnailUrl"
          :alt="`Image ${img.id}`"
          class="w-full h-full cursor-pointer rounded-lg object-cover aspect-4/3"
          loading="lazy"
          @click="openLightbox(i + 1)"
        />
      </div>
    </template>

    <!-- Even count: 2 columns -->
    <div v-else class="grid grid-cols-2 gap-1">
      <img
        v-for="(img, i) in images"
        :key="img.id"
        :src="img.thumbnailUrl"
        :alt="`Image ${img.id}`"
        class="w-full h-full cursor-pointer rounded-lg object-cover aspect-4/3"
        loading="lazy"
        @click="openLightbox(i)"
      />
    </div>

    <vue-easy-lightbox
      :visible="visibleRef"
      :imgs="imgsRef"
      :index="indexRef"
      :scrollDisabled="false"
      loop
      :zoomScale="0.5"
      @hide="onHide"
    />
  </div>
</template>

<script setup lang="ts">
import VueEasyLightbox, { useEasyLightbox } from 'vue-easy-lightbox'

export interface PostImage {
  id: string
  thumbnailUrl: string
  compressedUrl: string
}

const props = defineProps<{
  images: PostImage[]
}>()

const isOdd = computed(() => props.images.length % 2 !== 0)
const rest = computed(() => props.images.slice(1))

const preview = computed(() => props.images.map(img => img.compressedUrl))

const { show, imgsRef, indexRef, onHide, visibleRef } = useEasyLightbox({
  imgs: preview.value,
  initIndex: 0,
})

watch(preview, (newImgs) => {
  imgsRef.value = newImgs
})

function openLightbox(index: number) {
  show(index)
}
</script>
