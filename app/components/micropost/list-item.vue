<template>
  <div>
    <div class="flex justify-between items-center mb-2">
      <div class="inline-block text-gray-500 text-sm" v-if="publishedAt">
        {{ new Date(publishedAt).toLocaleString() }}
      </div>
      <div class="flex items-center gap-3">
        <micropost-dialog-edit
          :id="id"
      
          buttonIcon="lucide:edit-2"
          @updated="() => emit('updated', id)"
        />
        <div>
          <common-delete-confirm @confirm="() => deletePost(id)" />
        </div>
        <u-icon
          name="lucide:link"
          class="inline-block w-4 h-4 text-gray-400 cursor-pointer"
          @click="copyLink(id)"
        />
      </div>
    </div>
    <slot />
  </div>
</template>
<script lang="ts" setup>
const props = defineProps<{
  id: string;
  publishedAt?: string;
}>();

const emit = defineEmits<{
  (e: 'updated', id: string): void
  (e: 'deleted', id: string): void
}>()

const toast = useToast();
const url = useRequestURL();
const { copy } = useClipboard();

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
    toast.add({
      title: 'Post deleted',
      color: 'error',
      duration: 3000,
      progress: false,
    });
    emit('deleted', id);
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
</script>