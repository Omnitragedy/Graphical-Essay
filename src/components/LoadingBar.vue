<template>
	<div
		class="select-none absolute bottom-0 left-0 w-full transition duration-1000"
		:class="{
			'opacity-0': state != 'loading',
			'opacity-100': state == 'loading',
		}"
	>
		<div
			class="text-sm text-white text-center pulse absolute bottom-0 mb-1 left-0 w-full"
		>
			loading. . .
		</div>
		<div
			class="h-6 bg-red-700 transition-all"
			:style="'width: ' + progress + '%'"
		></div>
	</div>
</template>

<style>
.pulse {
	animation: pulse 2s infinite;
}
@keyframes pulse {
	0% {
		opacity: 0.5;
	}
	50% {
		opacity: 1;
	}
	100% {
		opacity: 0.5;
	}
}
</style>

<script setup>
import { ref } from "vue";
import { emitter } from "../game/Emitter";

const props = defineProps({
	state: String,
});

const currentLoad = ref(null);
const progress = ref(0);

emitter.on("file-loaded", (e) => {
	currentLoad.value = e;
	progress.value =
		(currentLoad.value.itemsLoaded / currentLoad.value.itemsTotal) * 100;
});
</script>
