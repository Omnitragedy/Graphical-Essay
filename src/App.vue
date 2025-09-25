<template>
	<Curtain :state="gameState">
		<div class="h-full flex items-center justify-center">
			<div
				class="flex justify-end items-end bg-black transition duration-[2000ms]"
				:class="{
					'bg-opacity-0': gameState != 'loading',
					'bg-opacity-100':
						gameState == 'loading' || gameState == 'initializing',
				}"
			>
				<div class="px-8 py-4 h-full">
					<div class="flex flex-col justify-between h-full">
						<div>
							

							<div
								class="transiton-opacity duration-[2000ms] ease-in"
								:class="{
									'opacity-100': gameState == 'paused' || gameState == 'ready',
									'opacity-0': gameState != 'paused',
								}"
							>
								<StartButton class="my-8" :state="gameState" />
								<Instructions :state="gameState" />
								<Settings :state="gameState" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<LoadingBar :state="gameState" />
	</Curtain>

	<ExhibitPanel v-if="gameState == 'playing'"></ExhibitPanel>

	<div>
		<MobileControls v-if="isMobile && gameState == 'playing'"></MobileControls>
	</div>

	<!-- Text overlay for in-world prompts -->
	<TextOverlay />
	<!-- Zoom hint (top-left) -->
	<div class="zoom-hint fixed top-4 left-4 z-60 pointer-events-none">
		<div class="bg-black bg-opacity-70 text-white text-[22px] px-3 py-1 rounded select-none">
      Hold Z to zoom
    </div>
	</div>
</template>

<script setup>
import { onMounted, reactive, watch } from "vue";
import LoadingBar from "./components/LoadingBar.vue";
import StartButton from "./components/StartButton.vue";
import Curtain from "./components/Curtain.vue";
import Instructions from "./components/Instructions.vue";
import { gameState } from "./game/State";
import Settings from "./components/Settings.vue";
import MobileControls from "./components/MobileControls.vue";
import ExhibitPanel from "./components/ExhibitPanel.vue";
import TextOverlay from "./components/TextOverlay.vue";
import { useMobile } from "./composables/useMobile";

const game = window.gameInstance;

const { isMobile } = useMobile();

const reload = () => {
	location.reload();
};

onMounted(() => {
	game.init();
});

watch(gameState, () => {
	/**
	 * while playing, prevent pinch-zoom on mobile devices
	 */
	if (gameState.value == "playing") {
		document.body.classList.add("touch-none");
	} else {
		document.body.classList.remove("touch-none");
	}
});
</script>
