<template>
    <el-form class="p-2 grid gap-y-2">
        <el-input v-model="text" placeholder="Text" type="textarea" :autosize="{ minRows: 3, maxRows: 20 }"
            ref="textField" />
        <div class="flex w-full gap-2">
            <image-uploader :thumbnail-url="images[0]?.thumbnailUrl" :id="images[0]?.key" width="100%"
                @uploaded="(id, thumbnailUrl) => onImageUploaded(0, id, thumbnailUrl)" @removed="onImageRemoved(0)" 
                 @processing="v => updateProcessingStatus(0, v)"
                />
            <image-uploader :thumbnail-url="images[1]?.thumbnailUrl" :id="images[1]?.key" width="100%"
                @uploaded="(id, thumbnailUrl) => onImageUploaded(1, id, thumbnailUrl)" @removed="onImageRemoved(1)"
                @processing="v => updateProcessingStatus(1, v)"
                />
        </div>
        <div class="w-full">
            <el-button type="default" v-if="imgCount > 1" @click="onSwap">Swap</el-button>
        </div>
        <el-input v-model="title" placeholder="Title" type="text"/>
        <VideoYoutubeInput class="w-full" v-model="ytVideoId" />
        <el-form-item>
            <slot></slot>
        </el-form-item>
    </el-form>
</template>

<script lang="ts" setup>
import type { PropType } from 'vue';
import { boolean } from 'zod';
import type { ImageUploaderModelItem } from '~/components/image/model';

const textField = ref<HTMLInputElement | null>(null)

const emits = defineEmits<{
    (event: 'ready', isReady: boolean): void
}>()


const title = defineModel('title', { required: false, type: String })
const text = defineModel('text', { required: true, type: String })
const ytVideoId = defineModel('videoId', { required: true, type: String })
const images = defineModel('images', { required: true, type: Object as PropType<(ImageUploaderModelItem | undefined)[]> })

const processingStatus = ref<boolean[]>([])

function updateProcessingStatus(index: number, value: boolean) {
    const status = [...processingStatus.value];
    status[index] = value;
    processingStatus.value = status;
}

watch(processingStatus, (v) => {
    if (v.length === 0 || v.every(val => !val)) {
        emits('ready', true)
    } else {
        emits('ready', false)
    }
})

function onImageUploaded(index: number, id: string, thumbnailUrl: string) {
    const arr = [...images.value]
    arr[index] = { key: id, thumbnailUrl }
    images.value = arr
}
function onImageRemoved(index: number) {
    const arr = [...images.value]
    arr[index] = undefined
    images.value = arr
}

const imgCount = computed(() => images.value.filter(v => v?.key).length)
function onSwap() {
    const arr = [...images.value]
    const tmp = arr[0]
    arr[0] = arr[1]
    arr[1] = tmp
    images.value = arr
}

onMounted(() => {
    if (textField.value) {
        textField.value.focus();
    }
})


</script>