<template>
	<div
		class="btn btn-lg flex flex-col"
		:class="{ disabled: state == 'loading' }"
		@click="start()"
	>
		<span>Play</span>
		<span class="text-xs normal-case"
			>check your volume, music will start<br /><span v-if="!isMobile"
				>Use WASD to move.</span
			></span
		>
	</div>
</template>

<script setup>
import { gameState } from "../game/State";
import { emitter } from "../game/Emitter";
import { useMobile } from "../composables/useMobile";

const { isMobile } = useMobile();

const props = defineProps({
	state: String,
});

const start = () => {
	if (gameState.value != "ready" && gameState.value != "paused") {
		return;
	}

	emitter.emit("controls-lock");
	emitter.emit("user-interaction");
};
</script>
