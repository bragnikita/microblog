<template>
    <el-form class="p-2">
        <el-form-item v-if="props.title">
            <span class="">{{ props.title }}</span>
        </el-form-item>
        <el-form-item label="Text" label-position="top">
            <el-input v-model="text" placeholder="Text" type="textarea" :autosize="{ minRows: 3, maxRows: 20 }" />
        </el-form-item>
        <el-form-item label="Video" label-position="top">
            <VideoYoutubeInput class="w-full" v-model="ytVideoId" />
        </el-form-item>
        <el-form-item label="Images" label-position="top">
            <el-space>
                <image-uploader :thumbnail-url="images[0]?.thumbnailUrl" :id="images[0]?.key"
                    @uploaded="(id, thumbnailUrl) => onImageUploaded(0, id, thumbnailUrl)"
                    @removed="onImageRemoved(0)" />
                <image-uploader :thumbnail-url="images[1]?.thumbnailUrl" :id="images[1]?.key"
                    @uploaded="(id, thumbnailUrl) => onImageUploaded(1, id, thumbnailUrl)"
                    @removed="onImageRemoved(1)" />
            </el-space>
            <div class="w-full">
                <el-button type="default" v-if="imgCount > 1" @click="onSwap">Swap</el-button>
            </div>
        </el-form-item>
        <el-form-item>
            <slot></slot>
        </el-form-item>
    </el-form>
</template>

<script lang="ts" setup>
import type { PropType } from 'vue';
import type { ImageUploaderModelItem } from '~/components/image/model';

const props = defineProps<{
    title?: string,
}>()


const text = defineModel('text', { required: true, type: String })
const ytVideoId = defineModel('videoId', { required: true, type: String })
const images = defineModel('images', { required: true, type: Object as PropType<(ImageUploaderModelItem | undefined)[]> })

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

</script>