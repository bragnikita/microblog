<template>
    <div class="bg-gray-100 p-2 mt-2 rounded-md">
        Login form
    </div>
</template>
<script lang="ts" setup>

definePageMeta({
  layout: "login",
});

const { query } = useRoute();
const storedKey = useLocalStorage('access-key', '');
const form = reactive({
    key: query.key as string || storedKey.value || ''
});
const { fetch: refreshSession } = useUserSession();
function onClearCache() {
    form.key = '';
    storedKey.value = '';
    alert('Cache cleared');
}
async function onSubmit() {
    // const data = await $fetch('/api/login', {
    //     method: 'POST',
    //     body: form
    // });
    // if (data.ok) {
    //     await refreshSession();
    //     storedKey.value = form.key;
    //     navigateTo({ name: 'microblog' });
    // } else {
    //     alert(data.message);
    // }
}
</script>
<style scoped>
.el-link {
    margin-right: 8px;
}
</style>