<script setup lang="ts">
import { NuxtLink } from '#components';

</script>

<template>
  <div class="h-full flex flex-col">
    <div class="relative">
      <div class="absolute">
        <NuxtLink to="/"
        class='flex justify-start items-start bg-black bg-opacity-40 text-white gap-2 p-2'>
          <div class='text-5xl md:text-7xl'>Haji<br/>の</div>
          <div class='text-4xl md:text-7xl'>旅<br/>旅</div>
        </NuxtLink>
      </div>
      <img src="/top-image.jpg" class="max-h-[150px] md:max-h-[300px] w-full object-cover object-center"/>
    </div>
    <div class="grow mx-auto w-full md:w-[600px] shadow-md">
      <slot/>
    </div>
  </div>
</template>