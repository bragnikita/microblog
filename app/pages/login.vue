<template>
    <div class="bg-gray-100 p-2 mt-2 rounded-md">
        <UForm :state="form" @submit="onSubmit" class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-1" for="access-key">Access Key</label>
                <UInput
                    id="access-key"
                    v-model="form.key"
                    type="text"
                    placeholder="Enter your access key"
                    class="w-full"
                    required
                />
            </div>
            <div class="flex items-center justify-between">
                <UButton type="submit" color="primary">Login</UButton>
                <div>
                    <a @click.prevent="onClearCache" class="text-sm cursor-pointer">Clear Cache</a>
                </div>
                </div>
        </UForm>
    </div>
</template>
<script lang="ts" setup>
definePageMeta({
    layout: "login",
    contentWidth: 'wide',
});
const toast = useToast();
const { query } = useRoute();
const storedKey = useLocalStorage('access-key', '');
const form = reactive({
    key: query.key as string || storedKey.value || ''
});
const { fetch: refreshSession, clear } = useUserSession();
function onClearCache() {
    form.key = '';
    storedKey.value = '';
    clear();
    toast.add({
        title: 'Cache cleared, logged out',
        color: 'warning',
    });
}
async function onSubmit() {
    const data = await $fetch(`/api/login`, {
        method: 'POST',
        body: form
    });
    if (data.ok) {
        await refreshSession();
        storedKey.value = form.key;
        navigateTo('/microblog');
    } else {
        toast.add({
            title: data.message,
            color: 'error',
        });
    }
}
</script>
<style scoped>
.el-link {
    margin-right: 8px;
}
</style>
