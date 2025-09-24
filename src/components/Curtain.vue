<template>
	<div
		v-show="['loading', 'ready', 'paused'].includes(state)"
		class="transition duration-1000 absolute inset-0"
		:class="{
			'bg-opacity-20': state != 'loading',
			'bg-opacity-100': state == 'loading',
		}"
	>
		<slot></slot>
	</div>
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps({
	state: String,
});
</script>
