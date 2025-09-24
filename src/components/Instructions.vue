<template>
	<div
		v-show="state != 'playing'"
		class="text-white mt-4 text-sm font-mono bg-opacity-50"
	>
	</div>
</template>

<script setup>
import { defineProps } from "vue";
const props = defineProps({
	state: String,
});
</script>
