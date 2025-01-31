<template>
    <MicropostEditForm
    title="New Micropost"
        v-model:text="model.text"
        v-model:video-id="model.ytVideoId"
        v-model:images="model.images"
    >
    <div class="flex w-full justify-center gap-1">
        <el-button type="primary" @click="() => submit.execute()">Submit</el-button>
        <el-button type="default" @click="">Return</el-button>
    </div>
</MicropostEditForm>
</template>

<script lang="ts" setup>
import type { ImageUploaderModelItem } from '~/components/image/model';

definePageMeta({
    middleware: ['authenticated']
})

const model = reactive<{
    text: string,
    ytVideoId: string,
    images: (ImageUploaderModelItem | undefined)[]
}>({
    text: '',
    ytVideoId: '',
    images: []
});

const payload = computed(() => ({
    text: model.text,
    imagdes: model.images.filter(v => !!v).map(v => ({ key: v!.key })),
    video: model.ytVideoId ? { youtubeId: model.ytVideoId } : undefined,
}));

const submit = useFetch('/api/microblog', {
    method: 'POST',
    body: payload,
    watch: false,
    immediate: false,
    onResponse: () => {
        navigateTo('/');        
    }
});
</script>