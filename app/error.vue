<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const is404 = computed(() => props.error.statusCode === 404)

function handleBack() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="min-h-screen bg-[radial-gradient(circle_at_16%_12%,rgba(233,184,170,0.28),transparent_28rem),radial-gradient(circle_at_86%_4%,rgba(199,220,224,0.56),transparent_24rem),linear-gradient(110deg,#f8f5ea_0%,#fbfaf4_46%,#eef3e6_100%)] text-[#273026]">
    <div class="flex min-h-screen flex-col items-center justify-center px-4">
      <div class="w-full max-w-md rounded-[1.5rem] border border-[#ded6c4] bg-[#fffdf7]/85 p-8 shadow-[0_10px_40px_rgba(80,72,54,0.10)] text-center">
        <p class="mb-2 font-sans text-xs font-bold uppercase tracking-[0.22em] text-[#3f6844]">
          {{ is404 ? '404' : error.statusCode }}
        </p>
        <h1 class="mb-3 text-3xl font-medium leading-tight">
          {{ is404 ? 'Страница не найдена' : 'Что-то пошло не так' }}
        </h1>
        <p class="mb-6 text-[#727967]">
          {{ is404 ? 'Такой страницы не существует или она была удалена.' : (error.message || 'Произошла непредвиденная ошибка.') }}
        </p>
        <UButton
          label="На главную"
          color="primary"
          variant="soft"
          class="rounded-full"
          @click="handleBack"
        />
      </div>
    </div>
  </div>
</template>
