<template>
  <div class="w-full flex flex-col gap-y-3">
    <input
      ref="fileInput"
      type="file"
      multiple
      class="hidden"
      @change="onFilesSelected"
    />
    <div class="flex flex-wrap gap-3" ref="sortableParent">
      <CollPhoto
        v-for="(fileObj, idx) in files"
        :key="fileObj.id"
        :id="fileObj.id"
        :image-url="fileObj.previewUrl"
        @uploaded="(id) => console.log('Uploaded', id)"
        @deleted="onFileDeleted"
        :processing="fileObj.processing"
      />
    </div>
    <div
      class="w-full h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-gray-500"
      @click="() => fileInput?.click()"
    >
      <UIcon name="lucide:image-plus" class="w-8 h-8 text-gray-400" />
    </div>
    <div>
      <UButton
        label="Finish processing"
        @click="files.forEach((f) => (f.processing = false))"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { useDragAndDrop } from "@formkit/drag-and-drop/vue";
import { defineEmits, ref, watch } from "vue";
import CollPhoto from "~/components/photo/CollPhoto.vue";

interface FileWithId {
  id: string;
  previewUrl?: string;
  processing?: boolean;
}

// const props = defineProps<{ model: string[] }>();
const model = defineModel<string[]>({
  type: Array,
  default: () => [],
});

const emit = defineEmits<{
  (e: "busy", isBusy: boolean): void;
}>();

const [sortableParent, files] = useDragAndDrop(
  model.value.map((id) => ({ id } as FileWithId))
);
const fileInput = ref<HTMLInputElement | null>(null);

// Example usage: emit 'busy' when files are being processed, 'ready' when done
watch(
  () => files.value.some((f) => f.processing),
  (newVal, oldVal) => {
    console.log("Busy state changed from ", oldVal, " to ", newVal);
    if (newVal === oldVal) return; // No change
    emit("busy", newVal);
  },
  { immediate: true }
);

function onFilesSelected(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!input.files) return;
  const selected = Array.from(input.files);
  for (const file of selected) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      files.value.push({
        id: crypto.randomUUID(),
        previewUrl: imageUrl,
        processing: true,
      } as FileWithId);
    };
    reader.readAsDataURL(file);
  }
  // TODO fetch upload URLs for all files
  // TODO upload all files
  // TODO set processing = false for all files when done

  // Reset input so same file can be reselected if needed
  input.value = "";
}
function onFileDeleted(id: string) {
  try {
    URL.revokeObjectURL(files.value.find((f) => f.id === id)?.previewUrl || "");
  } catch (error) {
    console.error("Error revoking object URL:", error);
  }
  files.value = files.value.filter((f) => f.id !== id);
}

const readyFiles = computed(() => files.value.filter((f) => !f.processing));

// Watch for changes in files and emit updated id list
watch(
  readyFiles,
  (newFiles) => {
    console.log('Ready files changed, new IDs:', newFiles.map((f) => f.id));
    model.value = newFiles.map((f) => f.id);
  },
  { deep: true }
);
</script>
