<template>
  <div class="h-full flex flex-col">
    <div class="p-2 flex justify-end border-b border-gray-200 sticky top-0 bg-white z-10" v-if="loggedIn">
      <el-button type="primary" :icon="Plus" size="large" :tag="NuxtLink" to="/twits/new">Add
        post</el-button>
    </div>
    <div class="text-center p-3 min-h-[50px]" v-if="list.length === 0">
      <el-text type="info" v-if="!isLoading">No posts yet</el-text>
      <div v-else>Loading...</div>
    </div>
    <div v-else class="grow flex flex-col gap-2 p-1">
      <div v-for="(item, idx) in list" :key="item.id">
        <el-divider v-if="idx > 0" />
        <MicroPost :model="item">
          <template #actions>
            <div class="w-full grid grid-cols-2 items-center">
              <div class="justify-self-start">
                <el-button v-if="loggedIn" :icon="Setting" circle @click="() => openDialog(item.id)" />

              </div>
              <el-icon color="#9ca3af" class="cursor-pointer justify-self-end"
                @click="() => navigateTo({ name: 'twits-id', params: { id: item.id } })">
                <Eye />
              </el-icon>
            </div>
          </template>
        </MicroPost>
      </div>
      <div class="text-center mt-4 w-full">
        <el-button type="default" size="large" class="w-full" @click="fetchNext" :loading="isLoading"
          :disabled="isLoading">Load more</el-button>
      </div>
    </div>
    <el-dialog align-center v-model="actionsDialog" :close-on-click-modal="true" :close-on-press-escape="true"
      :show-close="true" width="50%">
      <div class="flex flex-col items-stretch gap-y-2 mt-1">
        <el-button type="primary" @click="() => navigateTo({ name: 'twits-id-edit', params: { id: selectedItemId } })">
          Edit
        </el-button>
        <div class="w-full">
          <micropost-delete-btn :id="selectedItemId" @deleted="() => { onRemove(selectedItemId) }" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { NuxtLink } from "#components";
import { View as Eye, Plus, Setting } from "@element-plus/icons-vue";
import MicroPost from "~/components/micropost/MicroPost.vue";
import type { Model } from "~/components/micropost/model";
const { loggedIn } = useUserSession();

const rest = ref<Model[]>([])
const isLoading = ref(true)
onMounted(async () => {
  await fetchNext()
})


const list = computed(() => {
  return useSortBy(rest.value, (v => v.timestamp)).reverse()
})

const fetchNext = async () => {
  const before = useLast(list.value)?.timestamp
  isLoading.value = true
  const { list: nextChunk } = await $fetch('/api/microblog', { query: { before } })
  rest.value = useUniqBy([...rest.value, ...nextChunk], v => v.id)
  isLoading.value = false
  if (before && nextChunk.length === 0) {
    ElMessage.info('No older posts')
  }
}

const actionsDialog = ref(false)
const selectedItemId = ref(-1)

const openDialog = (id: number) => {
  selectedItemId.value = id
  actionsDialog.value = true
}
const onRemove = (id: number) => {
  rest.value = rest.value.filter(v => v.id !== id)
  actionsDialog.value = false;
}

</script>
