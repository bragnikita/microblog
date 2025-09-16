<template>
	<u-button color="error" @click="showConfirmToast" icon="lucide:trash-2"/>
</template>

<script setup lang="ts">
import { defineEmits } from 'vue';

const emit = defineEmits<{ (e: 'confirm'): void }>();

function showConfirmToast() {
	useToast().add({
		title: 'Confirm Deletion',
		description: 'Are you sure you want to delete this item?',
		color: 'error',
		actions: [
			{
				label: 'Delete',
				color: 'error',
				onClick: () => emit('confirm'),
			},
			{
				label: 'Cancel',
				color: 'neutral',
                onClick: (e) => {e?.stopPropagation()}, // Just close the toast
			},
		],
	});
}
</script>
