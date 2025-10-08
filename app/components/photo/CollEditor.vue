<template>
  <div class="w-full flex flex-col">
    <input
      ref="fileInput"
      type="file"
      multiple
      class="hidden"
      @change="onFilesSelected"
    />
    <div class="flex flex-wrap gap-3 mb-2" ref="sortableParent">
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
const model = defineModel<FileWithId[]>({
  type: Array,
  default: () => [],
});

const emit = defineEmits<{
  (e: "busy", isBusy: boolean): void;
}>();

const [sortableParent, files] = useDragAndDrop(
  model.value.map((f) => ({ id: f.id, previewUrl: f.previewUrl } as FileWithId))
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

async function onFilesSelected(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!input.files) return;
  const selected = Array.from(input.files);

  const uploadUrls = await $fetch("/api/microblog/content/upload", {
    method: "POST",
    body: selected.map((f) => ({ filename: f.name, type: f.type })),
  });

  for (let i = 0; i < selected.length; i++) {
    const reader = new FileReader();
    const task = uploadUrls[i]!;
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      files.value.push({
        id: task.id,
        previewUrl: imageUrl,
        processing: true,
      } as FileWithId);
    };
    reader.readAsDataURL(selected[i]!);
  }

  await Promise.all(
    uploadUrls.map(async (f, idx) => {
      await $fetch(f.upload.url, {
        method: f.upload.method as never,
        headers: f.upload.headers,
        body: selected[idx]!,
      });
      // const toUpdate = files.value.find((r) => f.id === r.id);
      // if (toUpdate) {
      //   toUpdate.previewUrl = f.download.thumbnailUrl;
      // }
    })
  );
  await waitForUploadCompletion(uploadUrls.map((u) => u.id));

  // Reset input so same file can be reselected if needed
  input.value = "";
}

async function waitForUploadCompletion(ids: string[]) {
  // Poll the server for status
  let chunkProcessingStatus = "processing";
  let idsToCheck = [...ids];
  while (chunkProcessingStatus === "processing") {
    const res = await $fetch(`/api/microblog/content/info`, {
      method: "POST",
      body: { imageKeys: idsToCheck },
    });
    res.items.forEach((item: any) => {
      if (item.status === "completed" || item.status === "failed") {
        const toUpdate = files.value.find((r) => item.key === r.id);
        if (toUpdate) {
          toUpdate.processing = false;
          toUpdate.previewUrl = item.thumbnailUrl;
        }
        idsToCheck = idsToCheck.filter((id) => id !== item.key);
      }
    });
    if (idsToCheck.length === 0) {
      chunkProcessingStatus = "completed";
    } else {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds before polling again
    }
  }
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
    console.log(
      "Ready files changed, new IDs:",
      newFiles.map((f) => f.id)
    );
    model.value = newFiles;
  },
  { deep: true }
);



</script>
