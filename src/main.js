import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import Game from "./game/Game";

const game = new Game();

// Expose the game object globally to aid debugging (inspect via DevTools console)
window.__GAME = game;

/**
 * Resume the AudioContext after a user gesture, then play any queued sounds.
 * The ResourceLoader queues sounds on `game.world._queuedAudio` when the context
 * is not yet running. This installs one-time listeners for common gesture events.
 */
function resumeAudioOnUserGesture() {
	const tryResume = async () => {
		try {
			const listener = game && game.player && game.player.camera && game.player.camera.listener;
			if (!listener) return;

			const ctx = listener.context;
			if (!ctx) return;

			// If already running there's nothing to do.
			if (ctx.state === "running") return;

			try {
				await ctx.resume();
				console.log("AudioContext resumed by user gesture");
			} catch (err) {
				console.warn("AudioContext resume failed:", err);
			}

			// Play any queued THREE.Audio instances that were waiting for resume.
			const queued = game.world && game.world._queuedAudio ? game.world._queuedAudio : [];
			queued.forEach((sound) => {
				try {
					sound.play();
				} catch (e) {
					console.warn("Queued audio play failed:", e);
				}
			});
			if (game.world) game.world._queuedAudio = [];
		} finally {
			// Remove listeners after first attempt
			document.removeEventListener("click", tryResume);
			document.removeEventListener("keydown", tryResume);
			document.removeEventListener("touchstart", tryResume);
		}
	};

	// Install one-time listeners for common user gestures.
	document.addEventListener("click", tryResume, { once: true });
	document.addEventListener("keydown", tryResume, { once: true });
	document.addEventListener("touchstart", tryResume, { once: true });
}

// Install the handler now — it will no-op if the listener isn't ready yet,
// and will take effect once the user interacts.
resumeAudioOnUserGesture();

createApp(App).mount("#app");

// Also try installing again after mount in case player/camera are created later.
setTimeout(resumeAudioOnUserGesture, 500);
