<script setup lang="ts">
import { NuxtLink } from '#components';

</script>

<template>
  <div class="h-full flex flex-col">
    <div class="relative h-[150px] md:h-[300px]">
      <div class="absolute">
        <NuxtLink to="/"
        class='flex justify-start items-start bg-black bg-opacity-40 text-white gap-2 p-2'>
          <div class='text-5xl md:text-7xl'>Haji<br/>の</div>
          <div class='text-4xl md:text-7xl'>旅<br/>旅</div>
        </NuxtLink>
      </div>
        <img src="/top-image.jpg" class="h-full w-full object-cover object-center "/>
    </div>
    <div class="grow mx-auto w-full md:w-[600px] relative">
      <div class="absolute top-[-50px] right-0 left-0 bottom-0 shadow-md bg-white md:rounded-md">
        <slot/>
      </div>
    </div>
  </div>
</template>