<template>
  <div class="h-full flex flex-col">
    <div
      class="p-2 flex justify-end border-b border-gray-200 sticky top-0 bg-white z-10"
      v-if="loggedIn"
    >
     Add post button here
    </div>
    <div class="text-center p-3 min-h-[50px]">
      <div type="info" v-if="!isLoading">No posts yet</div>
      <div v-else>Loading...</div>
    </div>
    <div  class="grow flex flex-col gap-2 p-1">
        List of posts here
      <div class="text-center mt-4 w-full">
         Load more button here
      </div>
    </div>    
  </div>
</template>

<script lang="ts" setup>
import type { Model } from "~/components/micropost/model";
const { loggedIn } = useUserSession();

const rest = ref<Model[]>([]);
const isLoading = ref(true);

</script>
