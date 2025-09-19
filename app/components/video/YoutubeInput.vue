<template>
    <div class="flex flex-col gap-2">
        <UButton v-if="model" @click="onRemove" type="button" plain size="xl">Remove</UButton>
        <UButton v-else @click="onPasteUrl" type="button" plain size="xl">Paste Youtube URL</UButton>
        <lite-yt-embed :id="model" v-if="model" ref="playerRef" title="" />
    </div>
</template>
<script lang="ts" setup>
import 'vue-lite-youtube-embed/style.css'
import LiteYtEmbed from 'vue-lite-youtube-embed'
import { UBadge, UButton } from '#components'

const model = defineModel<string>()
const playerRef = ref(undefined)
const inputRef = ref<HTMLInputElement | undefined>(undefined)
const url = ref('')

watch(url, (url) => {
    if (!url) {
        return;
    }
    const id = extractId(url)
    if (!id) {
        console.warn('Not Youtube URL. Clipboard content: ', url)
        // ElMessage.warning('Invalid Youtube URL')
        return
    }
    model.value = id || ''
})

function onPasteUrl() {
    navigator.clipboard.readText().then((text) => {
        url.value = text;
    }).catch((err) => {
        // ElMessage.error('Failed to read clipboard contents: ' + err);
    });
}

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