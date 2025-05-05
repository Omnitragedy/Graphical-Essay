<template>
	<div class="fixed bottom-0 left-0 mb-2 ml-2 z-10 select-none">
		<div
			class="grid grid-cols-3 lg:w-48 lg:h-48 w-32 h-32"
			@touchmove="onTouchMove"
			@touchend="onTouchEnd"
			@touchstart="onTouchStart"
		>
			<div
				ref="controlRefs"
				:class="{ 'bg-black/10': control.iconClass !== false }"
				class="flex items-center justify-center"
				v-for="control in controls"
			>
				<div
					:class="{ 'bg-pink-500/50': control.isActive }"
					class="flex items-center justify-center w-full h-full"
				>
					<IconArrowVue
						v-if="control.iconClass !== false"
						:class="control.iconClass"
						class="w-4 text-white"
					></IconArrowVue>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { onMounted, ref, watch, nextTick } from "vue";
import IconArrowVue from "./IconArrow.vue";
import { emitter } from "../game/Emitter";

const controls = ref([
	{ isActive: false, iconClass: false, moving: ["forward", "left"] },
	{ isActive: false, iconClass: "rotate-180", moving: ["forward"] },
	{ isActive: false, iconClass: false, moving: ["forward", "right"] },
	{ isActive: false, iconClass: "rotate-90", moving: ["left"] },
	{ isActive: false, iconClass: false, moving: [] },
	{ isActive: false, iconClass: "-rotate-90", moving: ["right"] },
	{ isActive: false, iconClass: false, moving: ["backward", "left"] },
	{ isActive: false, iconClass: "", moving: ["backward"] },
	{ isActive: false, iconClass: false, moving: ["backward", "right"] },
]);

/**
 * array of directions to send to the game controls via emitter
 */
const moving = ref([]);

/**
 * grab the bounding rectangles of each control box
 */
const controlRefs = ref([]);

watch(moving, () => {
	emitter.emit("mobile-move", moving.value);
});

/**
 * send a bounding rectangle and an {x,y} point
 */
function containsPoint(rect, point) {
	return (
		rect.x <= point.x &&
		point.x <= rect.x + rect.width &&
		rect.y <= point.y &&
		point.y <= rect.y + rect.height
	);
}

/**
 * clear the moving array on touch end
 */
function onTouchEnd() {
	moving.value = [];
	controls.value.forEach((box) => {
		box.isActive = false;
	});
}

function onTouchStart(e) {
	const touch = e.touches.item(e.touches.length - 1);
	getTouchDirection(touch);
}

function onTouchMove(e) {
	const touch = e.touches.item(e.touches.length - 1);
	getTouchDirection(touch);
}

/**
 * find out which quadrant contains the touch point and copy that box's moving array to the main moving array
 */
function getTouchDirection(touch) {
	controls.value.forEach((box, index) => {
		const rect = controlRefs.value[index].getBoundingClientRect();
		let contains = containsPoint(rect, {
			x: touch.clientX,
			y: touch.clientY,
		});
		if (contains) {
			box.isActive = true;
			moving.value = box.moving;
		} else {
			box.isActive = false;
		}
	});
}
</script>
