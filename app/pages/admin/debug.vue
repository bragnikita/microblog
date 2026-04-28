<template>
  <div class="mx-auto max-w-3xl space-y-6 py-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-bold">Debug</h1>
      <p class="text-sm text-gray-600">
        Run a direct connection test against the linked Aurora DSQL cluster.
      </p>
    </div>

    <div class="flex items-center gap-3">
      <UButton
        color="primary"
        size="xl"
        :loading="loading"
        @click="runTest"
      >
        DB connection test
      </UButton>
      <span v-if="loading" class="text-sm text-gray-500">Running query...</span>
    </div>

    <div class="rounded-md border border-gray-200 bg-gray-50 p-4">
      <pre class="overflow-x-auto whitespace-pre-wrap text-sm">{{ panelText }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  contentWidth: 'wide',
  middleware: 'authenticated',
})

const loading = ref(false)
const result = ref<unknown>({
  ok: null,
  message: 'Press "DB connection test" to run the DSQL access check.',
})

const panelText = computed(() => JSON.stringify(result.value, null, 2))

async function runTest() {
  loading.value = true

  try {
    result.value = await $fetch('/api/debug/dsql', {
      method: 'POST',
    })
  } catch (error: any) {
    result.value = {
      ok: false,
      message: error?.data?.message || error?.message || 'Request failed',
      details: error?.data?.details || null,
    }
  } finally {
    loading.value = false
  }
}
</script>
