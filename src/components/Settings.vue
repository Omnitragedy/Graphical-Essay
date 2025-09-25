<template>
	<div id="settings-menu" @click.stop class="space-y-2 text-gray-500">
		<div class="flex flex-row mt-4 items-center justify-between space-x-8">
			<div class="flex md:space-x-4 md:flex-row flex-col space-x-0">
				<div v-if="canUseVR">
					<label for="settings-vr" class="flex items-center space-x-1">
						<input
							id="settings-vr"
							type="checkbox"
							v-model="settings.vr"
							class="form-checkbox rounded text-pink-500"
						/>
						<span>Enable VR</span>
					</label>
				</div>
			</div>
			<div class="flex space-x-2 items-center">
				<select
					class="py-1 px-1 text-xs text-black"
					v-model="settings.quality"
					name="quality"
					id="settings-quality"
				>
					<option v-for="setting in qualitySettings" :value="setting.value">
						{{ setting.label }}
					</option>
				</select>
			</div>
		</div>

		<!-- Controls section -->
		<div class="mt-3 p-3 bg-gray-800/100 rounded text-xl text-white">
			<div class="font-semibold mb-2">Controls</div>
			<ul class="list-disc list-inside space-y-1 text-lg text-gray-200">
				<li>Arrow keys or WASD — Move</li>
				<li>Mouse — Look around</li>
				<li>Z (hold) — Zoom</li>
				<li>Esc — Pause/unlock pointer</li>
			</ul>
		</div>
	</div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed, watch, watchEffect } from "vue";
import { settings } from "../game/Settings";

const props = defineProps({
	active: {
		type: Boolean,
	},
});

const canUseVR = ref(false);

onMounted(() => {
	if ("xr" in navigator) {
		navigator.xr
			.isSessionSupported("immersive-vr")
			.then(function (supported) {
				canUseVR.value = supported;
			})
			.catch(() => {
				console.warn(
					"Exception when trying to call xr.isSessionSupported",
					exception
				);
			});
	}
});

const qualitySettings = [
	{ value: "high", label: "quality" },
	{ value: "medium", label: "balanced" },
	{ value: "low", label: "performance" },
];
</script>
