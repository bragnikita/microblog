<template>
    <el-space direction="vertical" fill>
        <el-button v-if="model" @click="onRemove">Remove</el-button>
        <el-input v-else name="youtubeVideoUrl" type="text" v-model="url" class="w-full" ref="inputRef" />
        <lite-yt-embed :id="model" v-if="model" ref="playerRef" title="" />
    </el-space>
</template>
<script lang="ts" setup>
import 'vue-lite-youtube-embed/style.css'
import LiteYtEmbed from 'vue-lite-youtube-embed'

const model = defineModel<string>()
const playerRef = ref(undefined)
const inputRef = ref<HTMLInputElement | undefined>(undefined)
const url = ref('')

watch(url, (url) => {
    const id = extractId(url)
    model.value = id || ''
})

function onRemove() {
    url.value = ''
    model.value = ''
    nextTick(() => {
        inputRef.value?.focus()
    })
}

function extractId(input: string) {
    if (input.trim() === '') return undefined;
    try {
        const asUrl = new URL(input)
        if (asUrl.host === 'youtu.be') {
            return asUrl.pathname.substring(1)
        }
        if (asUrl.pathname.startsWith('/embed/')) {
            return asUrl.pathname.substring(7)
        }
        if (asUrl.pathname.startsWith('/shorts')) {
            return asUrl.pathname.substring(8)
        }
        return asUrl.searchParams.get('v')
    } catch (e) {
        return undefined
    }
}
</script>