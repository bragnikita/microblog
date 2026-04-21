<template>
  <div class="pb-3">
    <div class="grid gap-1 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" ref="gridRef">
      <a
        v-for="(image, i) in images"
        :key="image.id"
        class="block aspect-square cursor-pointer relative"
        @click="onImageClick(i)"
      >
        <grid-photo
          :imageUrl="image.thumbnailUrl"
          :alt="`Photo ${image.id}`"
        />
        <div
          v-if="selectable"
          class="absolute inset-0 flex items-center justify-center transition-all"
          :class="isSelected(image.id) ? 'bg-primary/20 ring-2 ring-primary ring-inset' : 'hover:bg-black/10'"
        >
          <div
            class="absolute top-1 left-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
            :class="isSelected(image.id) ? 'bg-primary border-primary text-white' : 'bg-white/80 border-gray-400'"
          >
            <UIcon v-if="isSelected(image.id)" name="i-lucide-check" class="w-4 h-4" />
          </div>
        </div>
      </a>
    </div>
    <vue-easy-lightbox
      v-if="!selectable"
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
import VueEasyLightbox, { useEasyLightbox } from 'vue-easy-lightbox'
import GridPhoto from '~/components/image/GridPhoto.vue'

export interface SelectableGridImage {
  id: string
  thumbnailUrl: string
  compressedUrl: string
  originalUrl?: string
}

const props = withDefaults(defineProps<{
  images: SelectableGridImage[]
  selectable?: boolean
}>(), {
  selectable: false,
})

const selected = defineModel<string[]>('selected', { default: () => [] })

const gridRef = ref<HTMLElement | null>(null)

const preview = computed(() =>
  props.images.map((v) => v.compressedUrl || v.originalUrl!)
)

const { show, imgsRef, indexRef, onHide, visibleRef } = useEasyLightbox({
  imgs: preview.value || [],
  initIndex: 0,
})

watch(preview, (newImgs) => {
  imgsRef.value = newImgs
})

function isSelected(id: string) {
  return selected.value.includes(id)
}

function toggleSelection(id: string) {
  if (isSelected(id)) {
    selected.value = selected.value.filter((s) => s !== id)
  } else {
    selected.value = [...selected.value, id]
  }
}

function onImageClick(index: number) {
  if (props.selectable) {
    toggleSelection(props.images[index]!.id)
  } else {
    show(index)
  }
}
</script>
