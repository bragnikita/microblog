<template>
    <div ref="player" class="min-h-[1px] min-w-[1px]">
        <lite-yt-embed :id="id" title="" v-if="isVisible"/>
    </div>
</template>

<script lang="ts" setup>
import LiteYtEmbed from 'vue-lite-youtube-embed'
import 'vue-lite-youtube-embed/style.css'
import { useIntersectionObserver } from '@vueuse/core'

const player = ref(undefined)
const isVisible = ref(false)

const props = defineProps<{
    id: string,
}>()

const { stop } = useIntersectionObserver(player, ([entry], observer) => {
    if (entry.isIntersecting) {
        isVisible.value = true;
        stop()
    }
})
</script
