<template>
  <div ref="container" class="w-full h-full bg-gray-100 overflow-hidden">
    <div v-if="!isLoaded" class="w-full h-full flex items-center justify-center">
      <span class="loader" aria-label="Loading image..." />
    </div>
    <img
      v-if="isVisible"
      :src="imageUrl"
      :alt="alt"
      class="w-full h-full object-cover object-center"
      :class="isLoaded ? 'block' : 'hidden'"
      @load="isLoaded = true"
    />
  </div>
</template>

<script setup lang="ts">
import { useElementVisibility } from '@vueuse/core'

defineProps<{
  imageUrl: string
  alt?: string
}>()

const container = ref<HTMLElement | null>(null)
const isVisible = useElementVisibility(container)
const isLoaded = ref(false)
</script>

<style scoped>
.loader {
  border: 4px solid #e5e7eb;
  border-top: 4px solid #6366f1;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
