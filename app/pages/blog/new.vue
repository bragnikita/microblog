<template>
    <div class="max-w-2xl mx-auto p-6">
        <h1 class="text-3xl font-bold mb-4">Hello World — New Blog</h1>
        <p class="text-gray-600 mb-6">A minimal hello world page for <code>/blog/new</code>.</p>

        <form @submit.prevent="onSubmit" class="space-y-4">
            <label class="block">
                <span class="text-sm font-medium text-gray-700">Your name</span>
                <input
                    v-model="name"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your name"
                />
            </label>

            <div class="flex items-center gap-3">
                <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Say hello
                </button>
                <NuxtLink to="/blog" class="text-sm text-blue-600 hover:underline">Back to blog</NuxtLink>
            </div>
        </form>

        <div v-if="greeting" class="mt-6 p-4 bg-green-50 border border-green-100 rounded">
            <p class="text-green-800 font-medium">{{ greeting }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
    title: 'New Blog — Hello World'
})

const name = ref('')
const greeting = ref('')

function onSubmit() {
    greeting.value = name.value ? `Hello, ${name.value}!` : 'Hello, world!'
}
</script>