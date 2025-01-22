<template>
    <div>
        List of images
    </div>
    <div>Add button</div>
</template>

<script setup lang="ts">
import type { ImageUploaderModel } from './model';


interface Props {
    model: ImageUploaderModel,
}
const props = defineProps<Props>();

const list = computed(() => props.model.map(v => {
    return {
        id: v.key,
        url: v.thumbnailUrl,
    }
    // add files, that are not uploaded yet
}).concat([]));


</script>