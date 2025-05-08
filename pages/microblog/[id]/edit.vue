<template>
    <MicropostEditForm v-model:text="model.text" v-model:video-id="model.ytVideoId"
        v-model:images="model.images" @ready="v => isFormReady = v" v-model:title="model.title">
        <el-divider></el-divider>
        <div class="flex w-full justify-center gap-1">
            <el-button type="primary" size="large" @click="onSubmit" class="grow" :loading="isLoading" :disabled="isDisabled">Save</el-button>
            <el-button type="warning" size="large" @click="router.go(-1)">Cancel</el-button>
        </div>
    </MicropostEditForm>
</template>

<script lang="ts" setup>

definePageMeta({
    middleware: ['authenticated']
})

import type { ImageUploaderModelItem } from '~/components/image/model';
const route = useRoute();
const router = useRouter();

const model = reactive<{
    text: string,
    title: string,
    ytVideoId: string,
    images: (ImageUploaderModelItem | undefined)[]
}>({
    text: '',
    title: '',
    ytVideoId: '',
    images: []
});

const payload = computed(() => ({
    text: model.text,
    title: model.title,
    images: model.images.filter(v => !!v).map(v => ({ key: v!.key })),
    video: model.ytVideoId ? { youtubeId: model.ytVideoId } : undefined,
}));

const isFormReady = ref(true)
const isSubmitting = ref(false)

const isDisabled = computed(() => !isFormReady.value)
const isLoading = computed(() => isSubmitting.value );

const onSubmit = async () => {
    isSubmitting.value = true;
    await submit.execute();
    isSubmitting.value = false;
    navigateTo({name: 'microblog-id', params: { id: data.value?.id }})
}

const submit = useFetch(`/api/microblog/${route.params.id}`, {
    method: 'PUT',
    body: payload,
    watch: false,
    immediate: false,
});

const { data } = await useFetch(`/api/microblog/${route.params.id}`, {})
watch(data, () => {
    if (!data.value) return;
    model.text = data.value.text || '';
    model.title = data.value.title || '';
    model.ytVideoId = data.value.video?.youtubeId || '';
    model.images = data.value.images.map(v => ({ key: v.key, thumbnailUrl: v.thumbnailUrl }));
}, { immediate: true });
</script>