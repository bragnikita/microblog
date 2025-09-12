<template>
  <UCard>
    <div class="mb-4">
      <input
        type="file"
        multiple
        @change="onFilesSelected"
        class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
    </div>
    <div class="flex flex-wrap gap-2">
      <CollPhoto
        v-for="(fileObj, idx) in files"
        :key="fileObj.id"
        :id="fileObj.id"
        :file="fileObj.file"
        :uploadUrl="''"
        @uploaded="(id) => console.log('Uploaded', id)"
        @deleted="onFileDeleted"
      />
    </div>
  </UCard>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import CollPhoto from '~/components/photo/CollPhoto.vue';

interface FileWithId {
  id: string;
  file: File;
}

const files = ref<FileWithId[]>([]);

function onFilesSelected(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!input.files) return;
  const selected = Array.from(input.files);
  // Add new files, avoid duplicates by name+size+lastModified
  const existingKeys = new Set(files.value.map(f => f.file.name + f.file.size + f.file.lastModified));
  for (const file of selected) {
    const key = file.name + file.size + file.lastModified;
    if (!existingKeys.has(key)) {
      files.value.push({ id: crypto.randomUUID(), file });
    }
  }
  // Reset input so same file can be reselected if needed
  input.value = '';
}

function onFileDeleted(id: string) {
  files.value = files.value.filter(f => f.id !== id);
}
</script>