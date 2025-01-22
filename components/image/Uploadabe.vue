<template>
    <div class="h-[100px] w-[100px] border-2 border-gray-200 shadow-md relative group">
        <div
            :class="`${isProcess || state.isFailure || state.progress === 0 ? 'flex' : 'hidden'} group-hover:flex z-10 absolute inset-0 flex-col bg-black bg-opacity-50`">
            <div class="flex justify-center items-center grow">
                <el-icon-loading v-if="state.progress > 0 && state.progress < 100"
                    class="h-[30px] text-gray-400 is-loading" />
                <el-button circle :icon="ElIconUploadFilled" v-if="state.progress === 0" @click="doUpload" />
                <el-button :icon="ElIconCloseBold" circle type="danger" @click="onCancelClick" v-if="!isProcess" />
                <el-button :icon="ElIconCloseBold" type="danger" @click="onCancelClick" v-else
                    class="absolute top-0 right-0 w-[30px]" />
            </div>
            <div v-if="state.isFailure" class="text-white text-xs text-center bg-black">Failed to upload</div>
        </div>
        <img :src="state.previewUrl" v-if="state.previewUrl" class="h-full w-full object-cover object-center" />
    </div>
</template>

<script setup lang="ts">


interface Props {
    file: File,
    auto?: boolean,
    getUploadParams: (file: File) => Promise<{ url: string, headers: Record<string, string>, id: string, thumbnailUrl: string }>,
}

const props = withDefaults(defineProps<Props>(), { auto: false });
const emits = defineEmits<{
    (event: 'removed'): void,
    (event: 'uploaded', id: string, thimbnailUrl: string): void
}>();
const state = reactive({
    progress: 0,
    isFailure: false,
    previewUrl: '',
})
const isProcess = computed(() => state.progress > 0 && state.progress < 100);

const doUpload = async () => {
    const { url, headers, id, thumbnailUrl } = await props.getUploadParams(props.file);
    console.log(url, headers);
    state.isFailure = false
    state.progress = 50

    // mock
    // await new Promise(resolve => setTimeout(resolve, 2000));
    // state.progress = 100;
    // emits('uploaded');

    $fetch(url, {
        method: 'PUT',
        headers: {
            ...headers,
            // 'Content-Disposition': `attachment; filename="${encodeURIComponent(props.file.name)}"`,
        },
        body: props.file,
    }).then(() => {
        state.progress = 100;
        emits('uploaded', id, thumbnailUrl );
    }).catch(e => {
        console.log(e)
        state.progress = 0;
        state.isFailure = true;
    });
}

const onCancelClick = () => {
    if (state.progress === 100) {
        // TODO delete uploaded file
    }
    emits('removed');
}

onMounted(async () => {
    state.previewUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(props.file);
    });
    if (props.auto) {
        await doUpload();
    }
})
</script>