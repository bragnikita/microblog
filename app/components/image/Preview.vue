<template>
    <div class="relative" v-loading="isProcessing">
        <img v-if="!isProcessing" :src="thumbnailUrl" class="h-full w-full object-cover object-center"/>
        <el-button  v-if="!isProcessing" type="primary" :icon="ElIconClose" circle class="absolute top-[-5px] right-[-5px]" size="small" @click="emits('removed')"></el-button>
    </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
    thumbnailUrl: string,
    isProcessing?: boolean,
}>(), { isProcessing: false });
const emits = defineEmits<{
    (event: 'removed'): void,
}>();
</script>