<template>
    <div class="border-2 border-gray-200 shadow-md">
        <image-uploadabe :file="file" :getUploadParams="getUploadParams" v-if="file" @removed="file = undefined" @uploaded="onUploaded"/>
        <image-preview class="h-[100px] w-[100px]" :thumbnailUrl="props.thumbnailUrl" v-if="props.thumbnailUrl" @removed="onRemoved"/>
        <a class="h-[100px] w-[100px]  flex justify-center items-center" href="#"
            v-if="!props.thumbnailUrl && !file" @click="onOpenDialod">
            <input type="file" ref="upload" @change="onFileSelect" class="hidden" />
            <el-icon-plus class="h-[30px] text-gray-400" />
        </a>
    </div>
</template>

<script lang="ts" setup>

const props = defineProps<{
    thumbnailUrl?: string,
    id?: string,
}>()

const file = ref<File>();
const upload = ref<HTMLInputElement>()
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
    file.value = undefined
    emits('uploaded', id, thumbnailUrl);
}
const onRemoved = () => {
    file.value = undefined
    emits('removed');
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
</script>