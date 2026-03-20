<template>
  <div
    class="w-[200px] h-[200px] border border-gray-300 box-border flex items-center justify-center bg-center bg-no-repeat bg-cover relative"
    :style="imageUrl && !errorMsg ? { backgroundImage: `url('${imageUrl}')` } : {}"
  >
    <span v-if="errorMsg" class="text-red-500 text-xs text-center">{{ errorMsg }}</span>
    <span v-else-if="processing" class="text-gray-500 text-sm italic">
      <UIcon name="lucide:loader-2" class="w-12 h-12 animate-spin mr-2 inline-block text-white" />
    </span>
    <button
      @click.stop="emit('deleted', props.id)"
      class="cursor-pointer absolute z-10 w-6 h-6 flex items-center justify-center rounded-full bg-black border-2 border-white hover:bg-neutral-900 transition-colors duration-150 shadow"
      aria-label="Delete"
      style="top: 0; right: 0; transform: translate(50%, -50%);"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="white" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>


<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps({
  file: {
    type: File,
    required: false,
  },
  id: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: false,
    default: null,
  },
  processing: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const emit = defineEmits<{
  (e: "deleted", id: string): void;
  (e: "uploaded", id: string): void;
}>();

const errorMsg = ref<string | null>(null);

defineExpose({errorMsg });
</script>
