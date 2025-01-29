<template>
  <div class="flex flex-col gap-1">
    <div class="flex justify-end items-center gap-2">
      <div class="text-sm font-semibold text-gray-400">
        {{ daytimes.micropost(model.timestamp) }}
      </div>
      <div>
        <slot name="actions"/>
      </div>
    </div>
    <div class="px-2">{{ model.text }}</div>
    <div v-if="model.images" class="flex gap-1">
      <div class="w-1/2 h-1/4 min-h-[100px]" 
      v-for="(image, i) in model.images" :key="image.key">
        <el-image :src="image.thumbnailUrl" lazy :preview-src-list="preview" :initial-index="i" fit="cover" 
        class="aspect-[3/2] border border-gray-300 rounded-md"
        />
      </div>
    </div>
    <div v-if="model.video?.youtubeId">
      <video-preview :id="model.video.youtubeId" class=""/>
    </div>
    </div>
</template>

<script lang="ts" setup>
import type { Model } from "~/components/micropost/model";
import{daytimes} from '~/shared/formatters'

type Props = {
  model: Model
}

const props = defineProps<Props>()
const preview = computed(() => props.model.images?.map(v => {
  return v.originalUrl
}))

</script>