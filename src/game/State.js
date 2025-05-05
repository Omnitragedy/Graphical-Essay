import { ref, watch } from "vue";
import { emitter } from "./Emitter";

/**
 * loading
 * ready
 * paused
 * playing
 * done
 */
export const gameState = ref("loading");

watch(gameState, (newVal) => {
	emitter.emit("game-state", newVal);
});
