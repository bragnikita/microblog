<template>
    <MicropostEditForm title="Edit Micropost" v-model:text="model.text" v-model:video-id="model.ytVideoId"
        v-model:images="model.images">
        <div class="flex w-full justify-center gap-1">
            <el-button type="primary" @click="onSubmit" :loading="isLoading">Save</el-button>
            <el-button type="default" @click="router.go(-1)">Cancel</el-button>
        </div>
    </MicropostEditForm>
</template>

<script lang="ts" setup>
import type { ImageUploaderModelItem } from '~/components/image/model';
const route = useRoute();
const router = useRouter();

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
    images: model.images.filter(v => !!v).map(v => ({ key: v!.key })),
    video: model.ytVideoId ? { youtubeId: model.ytVideoId } : undefined,
}));

const isLoading = ref(false);

const onSubmit = async () => {
    isLoading.value = true;
    await submit.execute();
    isLoading.value = false;
    router.go(-1);
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
    model.ytVideoId = data.value.video?.youtubeId || '';
    model.images = data.value.images.map(v => ({ key: v.key, thumbnailUrl: v.thumbnailUrl }));
}, { immediate: true });
</script>