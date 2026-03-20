<template>
  <div class="max-w-xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold">New category</h1>
    
    <UForm :state="form" @submit="onSubmit" class="space-y-2">
      <UInput 
        v-model="form.id" 
        placeholder="unique-category-id" 
        :disabled="loading"
        class="w-full"
        size="xl"
      />

      <UInput 
        v-model="form.title" 
        placeholder="Category title" 
        :disabled="loading"
        class="w-full"
        size="xl"
      />

      <UTextarea 
        v-model="form.description" 
        placeholder="Category description (optional)" 
        :disabled="loading"
        :rows="4"
        class="w-full"
        size="xl"
      />

      <div v-if="error" class="text-red-500 text-sm mt-2">
        {{ error }}
      </div>
    </UForm>

    <div class="flex justify-between">
      <UButton 
        @click="onSubmit" 
        color="primary" 
        size="xl"
        :loading="loading"
        :icon="'lucide:save'"
      >
        Create Category
      </UButton>
      <UButton 
        color="secondary" 
        size="xl"
        @click="onReturn"
        :icon="'lucide:arrow-left'"
        :disabled="loading"
      >
        Cancel
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({ contentWidth: 'wide', layout: 'clear' })

const form = ref({
  id: '',
  title: '',
  description: ''
})

const loading = ref(false)
const error = ref('')

async function onSubmit() {
  loading.value = true
  error.value = ''
  
  try {
    const response = await $fetch('/api/blog/category', {
      method: 'POST',
      body: {
        id: form.value.id,
        title: form.value.title,
        description: form.value.description || undefined,
        // parentId is omitted for root categories
      }
    })
    
    console.log('Category created:', response)
    await navigateTo('/categories')
  } catch (e: any) {
    console.error('Error creating category:', e)
    error.value = e?.data?.message || e?.message || 'Failed to create category. Please try again.'
  } finally {
    loading.value = false
  }
}

function onReturn() {
  navigateTo('/categories')
}
</script>
