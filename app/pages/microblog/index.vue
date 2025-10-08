<template>
  <div class="h-full flex flex-col">
    <!-- <div
      class="p-2 flex justify-end border-b border-gray-200 sticky top-0 bg-white z-10"
    >
      <u-button
        label="New Post"
        icon="i-lucide-plus"
        to="/microblog/new"
        color="primary"
        size="xl"
      />
    </div> -->
    <div class="text-center p-3 min-h-[50px]" v-if="list.length === 0">
      <div type="info" v-if="!isLoading">No posts yet</div>
      <div v-else>Loading...</div>
    </div>
    <Transition>
    <div class="grow flex flex-col gap-2 p-1" v-if="list.length > 0">
        <div v-for="post in list" :key="post.id" class="p-4 rounded bg-white shadow">
          <div class="flex justify-between items-center mb-2">
            <div class="inline-block text-gray-500 text-sm">
              {{ new Date(post.publishedAt!).toLocaleString() }}
            </div>
            <div class="flex items-center gap-3">
              <micropost-dialog-edit :id="post.id" :model="post" 
              buttonIcon="lucide:edit-2"  
              @updated="() => updateOne(post.id)"
              />
              <div>
                <common-delete-confirm @confirm="() => deletePost(post.id)" />
                </div>
                <u-icon name="lucide:link" class="inline-block w-4 h-4 text-gray-400 cursor-pointer" @click="copyLink(post.id)" />
              </div>
            </div>
            <MicropostView :model="post" />
          </div>
          <div class="text-center mt-4 w-full">
            <u-button
            v-if="!isLoading"
            label="Load more"
            icon="i-lucide-arrow-down"
            @click="fetchNext"
            />
            <div v-else>Loading...</div>
          </div>
      </div>
      </Transition>
      </div>
    </template>

<script lang="ts" setup>
import _ from "lodash";
import type { Model } from "~/components/micropost/model";

const rest = ref<Model[]>([]);
const isLoading = ref(true);

const list = computed(() => {
  return _.sortBy(rest.value, (v) => v.publishedAt).reverse();
});

const toast = useToast();

onMounted(async () => {
  await fetchNext();
});

const fetchNext = async () => {
  const before = _.last(list.value)?.publishedAt;
  isLoading.value = true;
  const { list: nextChunk } = await $fetch("/api/microblog", {
    query: { before },
  });
  rest.value = _.uniqBy([...rest.value, ...nextChunk], (v) => v.id);
  isLoading.value = false;
  if (before && nextChunk.length === 0) {
    toast.add({
      title: 'No more posts',
      description: 'You have reached the end of the posts.',
      icon: 'i-lucide-thumbs-up',
      duration: 3000,
      progress: false,
    });
  }
};
const { copy } = useClipboard();
const url = useRequestURL();
const copyLink = (id: string) => {
  const newUrl = new URL(url);
  newUrl.pathname = `/microblog/${id}`;
  copy(newUrl.toString());
  toast.add({
    title: 'Link copied',
    description: 'The link to the post has been copied to clipboard.',
    icon: 'i-lucide-clipboard-copy',
    duration: 2000,
    progress: false,
  });
};

const deletePost = async (id: string) => {
  try {
    await $fetch(`/api/microblog/private/${id}`, { method: 'DELETE' });
    rest.value = rest.value.filter((p) => p.id !== id);
    toast.add({
      title: 'Post deleted',
      color: 'error',
      duration: 3000,
      progress: false,
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    toast.add({
      title: 'Error deleting post',
      description: 'An error occurred while deleting the post. Please try again.',
      color: 'error',
      duration: 5000,
    });
  }
};

const updateOne = async (id: string) => {
  try {
    const updated = await $fetch<Model>(`/api/microblog/${id}`);
    const index = rest.value.findIndex((p) => p.id === id);
    if (index !== -1) {
      // delete and re-add to trigger reactivity
      _.remove(rest.value, (p) => p.id === id);
      await nextTick(() => {
        rest.value.splice(index, 0, updated);
        toast.add({
          title: 'Post updated',
          icon: 'i-lucide-check-circle',
          duration: 3000,
          progress: false,
        });
      });
    }
  } catch (error) {
    console.error('Error updating post:', error);
    toast.add({
      title: 'Error updating post',
      description: 'An error occurred while updating the post. Please try again.',
      color: 'error',
      duration: 5000,
    });
  }
};

</script>
<style scoped>
/* we will explain what these classes do next! */
.v-enter-active,
.v-leave-active {
  transition: opacity 1s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>