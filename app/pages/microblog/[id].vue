<template>
  <div class="max-w-2xl mx-auto p-4">
    <div v-if="data">
      <MicropostView :model="data" />
    </div>
    <div v-else class="text-center text-gray-500">Loading...</div>
  </div>
</template>

<script lang="ts" setup>
const { data } = useFetch(`/api/microblog/${useRoute().params.id}`, {
  immediate: true,
});
</script>
