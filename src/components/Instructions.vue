<template>
	<div
		v-show="state != 'playing'"
		class="text-white mt-4 text-sm font-mono bg-opacity-50"
	>
		<a
			class="basic-link"
			target="_blank"
			href="https://www.anumberfromtheghost.com/about"
			>About this project</a
		>
	</div>
</template>

<script setup>
import { defineProps } from "vue";
const props = defineProps({
	state: String,
});
</script>
