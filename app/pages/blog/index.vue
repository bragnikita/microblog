<!-- filepath: /Users/nikita/myprojects/hajinomura-blog/app/pages/blog/index.vue -->
<template>
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-2xl font-semibold mb-4">Blog API Response</h1>

        <div v-if="pending" class="text-gray-500 mb-4">Loading...</div>
        <div v-else-if="error" class="text-red-600 mb-4">Error: {{ error.message }}</div>

        <pre
            class="bg-gray-100 p-4 rounded text-sm overflow-auto"
            v-else
        >{{ formatted }}</pre>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

definePageMeta({ contentWidth: 'wide' })

const { data, pending, error } = useFetch<number[]>('/api/blog')

const formatted = computed(() => JSON.stringify(data.value ?? null, null, 2))
</script>