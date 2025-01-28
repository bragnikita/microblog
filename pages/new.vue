<template>
    <el-form class="p-2">
        <h1>New micropost</h1>
        <el-form-item label="Text" label-position="top">
            <el-input v-model="model.text" placeholder="Text" type="textarea" :autosize="{minRows: 3, maxRows: 20}"/>
        </el-form-item>
        <el-form-item label="Video" label-position="top">
            <VideoYoutubeInput class="w-full" v-model="model.ytVideoId"/>
        </el-form-item>
        <el-form-item>
            <el-space>
                <image-uploader :thumbnail-url="image1?.thumbnailUrl" :id="image1?.key"
                    @uploaded="(id, thumbnailUrl) => image1 = { key: id, thumbnailUrl: thumbnailUrl }"
                    @removed="image1 = undefined" />
                <image-uploader :thumbnail-url="image2?.thumbnailUrl" :id="image2?.key"
                    @uploaded="(id, thumbnailUrl) => image2 = { key: id, thumbnailUrl: thumbnailUrl }"
                    @removed="image2 = undefined" />

            </el-space>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="() => submit.execute()">Submit</el-button>
        </el-form-item>
    </el-form>
</template>

<script lang="ts" setup>
import { LazyElIconLoading, ElIconLoading } from '#components';
import type { ImageUploaderModelItem } from '~/components/image/model';


const image1 = ref<ImageUploaderModelItem | undefined>({ key: '', thumbnailUrl: '' })
const image2 = ref<ImageUploaderModelItem | undefined>({ key: '', thumbnailUrl: '' })


const model = reactive({
    text: '',
    ytVideoId: ''
});
const payload = computed(() => ({
    text: model.text,
    images: [image1.value, image2.value].filter(v => v?.key),
    video: model.ytVideoId ? { youtubeId: model.ytVideoId } : undefined,
}));

const submit = useFetch('/api/microblog', {
    method: 'POST',
    body: payload,
    watch: false,
    immediate: false,
});
</script>