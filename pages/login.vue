<template>
    <div class="bg-gray-100 p-2 mt-2 rounded-md">
        <el-form :model="form">
            <el-form-item>
                <el-input clearable v-model="form.key" placeholder="Access key"></el-input>
            </el-form-item>
            <el-form-item>
                <el-space>
                    <el-button type="primary" @click="onSubmit">Login</el-button>
                    <el-link href="/" underline>See as guest<el-icon class="el-icon--right">
                            <icon-view />
                        </el-icon>
                    </el-link>
                    <el-divider direction="vertical"></el-divider>
                    <el-button type="warning" @click="onClearCache">Clear cache</el-button>
                </el-space>
            </el-form-item>
        </el-form>
    </div>
</template>
<script lang="ts" setup>
import { View as IconView } from '@element-plus/icons-vue';
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
    const data = await $fetch('/api/login', {
        method: 'POST',
        body: form
    });
    if (data.ok) {
        await refreshSession();
        storedKey.value = form.key;
        navigateTo({ name: 'microblog' });
    } else {
        alert(data.message);
    }
}
</script>
<style scoped>
.el-link {
    margin-right: 8px;
}
</style>