<template>
    <div class="relative">
        <el-button type="primary" :icon="ElIconClose" circle class="absolute top-[-5px] right-[-5px]" size="small" @click="emits('removed')"></el-button>
        <img :src="thumbnailUrl" class="h-full w-full object-cover object-center"/>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    thumbnailUrl: string,
}>();
const emits = defineEmits<{
    (event: 'removed'): void,
}>();
</script>