<template>
    <div class="border-2 border-gray-200 shadow-md h-[100px] w-[100px] flex justify-center items-center" v-loading="isProcessing">
        <div v-if="isFailure" class="z-10 flex h-full w-full justify-center items-center bg-white bg-opacity-50"> 
            <LazyElIconWarning class="h-[50px] text-red-500 cursor-pointer" @click="onRemoved"/>
        </div>
        <image-uploadabe :file="file" :getUploadParams="getUploadParams" v-else-if="file" @removed="file = undefined"
            @uploaded="onUploaded" />
        <image-preview class="h-full w-full" :thumbnailUrl="props.thumbnailUrl" v-else-if="props.thumbnailUrl"
            @removed="onRemoved" />
        <a class="h-full w-full  flex justify-center items-center" href="#" v-else-if="!props.thumbnailUrl && !file"
            @click="onOpenDialod">
            <input type="file" ref="upload" @change="onFileSelect" class="hidden" accept="image/*" :max="1" />
            <el-icon-plus class="h-[30px] text-gray-400" />
        </a>
    </div>
</template>

<script lang="ts" setup>
import { LazyElIconWarning } from '#components';


const props = defineProps<{
    thumbnailUrl?: string,
    id?: string,
}>()

const file = ref<File>();
const upload = ref<HTMLInputElement>()
const isFailure = ref(false)
const isProcessing = ref(false)
const emits = defineEmits<{
    (event: 'uploaded', id: string, thumbnailUrl: string): void,
    (event: 'removed'): void,
}>();

const onOpenDialod = () => {
    upload.value?.click();
}
const onFileSelect = (e: Event) => {
    file.value = (e.target as any).files[0];
}
const onUploaded = (id: string, thumbnailUrl: string) => {
    waitForUploadFinished(id)
}
const onRemoved = () => {
    reset()
    emits('removed');
}

const reset = () => {
    file.value = undefined
    isFailure.value = false
    isProcessing.value = false
}

const getUploadParams = async (file: File) => {
    const response = await $fetch('/api/microblog/content/upload', {
        method: 'POST',
        body: JSON.stringify({ filename: file.name, type: file.type }),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const { id } = response;
    const { url, headers } = response.upload;
    const { thumbnailUrl } = response.download
    return { url, headers, id, thumbnailUrl };
};

async function waitForUploadFinished(id: string) {
    isProcessing.value = true
    let attemptNumber = 0
    const stop = setInterval(async () => {
        attemptNumber++
        if (attemptNumber > 5) {
            isFailure.value = true
            isProcessing.value = false
            clearInterval(stop)
            return
        }
        const { items } = await $fetch('/api/microblog/content/info', {
            method: 'POST',
            body: { imageKeys: [id] }
        })
        if (items.length === 0 || items[0].isUploadFailed) {
            isFailure.value = true
            isProcessing.value = false
            clearInterval(stop)
            return
        } else if (items[0].isProcessed) {
            file.value = undefined
            isProcessing.value = false
            emits('uploaded', id, items[0].thumbnailUrl!);
            clearInterval(stop)
        }
    }, 2000)
}

</script>