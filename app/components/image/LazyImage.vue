<template>
	<div ref="container" class="relative flex items-center justify-center">
		<div v-if="!isLoaded" class="absolute inset-0 flex items-center justify-center bg-gray-100">
			<span class="loader" aria-label="Loading image..."></span>
		</div>
		<img
			v-if="isVisible"
			v-show="isLoaded"
			:src="imageUrl"
			:alt="alt"
			class="object-cover"
			@load="onLoad"
			:style="{ display: isLoaded ? '' : 'none' }"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useElementVisibility } from '@vueuse/core'

const props = defineProps<{
	imageUrl: string
	alt?: string
}>()

const container = ref<HTMLElement | null>(null)
const isVisible = useElementVisibility(container)
const isLoaded = ref(false)

function onLoad() {
	isLoaded.value = true
}
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
