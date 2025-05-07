<template>
  <el-popconfirm
    confirm-button-text="Yes"
    cancel-button-text="No"
    title="Delete post?"
    @confirm="onConfirm"
  >
    <template #reference>
      <el-button :icon="Delete" type="danger" class="w-full" />
    </template>
  </el-popconfirm>
</template>
<script setup lang="ts">
import { Delete } from "@element-plus/icons-vue";
const props = defineProps<{
  id: number,
}>();
const emits = defineEmits(['deleted']);

function onConfirm() {
  execute();
}

const { execute, status } = await useFetch(`/api/microblog/${props.id}`, {
  method: 'DELETE',
  immediate: false,
  onResponse: ({ error }) => {
    if (!error) {
      emits('deleted');
    }
  }
})
</script>