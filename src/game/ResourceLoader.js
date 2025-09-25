import { DRACOLoader, GLTFLoader } from "three/examples/jsm/Addons.js";
import * as THREE from "three";
import Game from "./Game";
import { emitter } from "./Emitter";
import { gameState } from "./State";
import noiseTexture from "#assets/textures/noise.png";

export default class ResourceLoder {
	constructor() {
		this.game = new Game();

		this.toLoad = 0;
		this.loaded = 0;

		this.gltfLoader = new GLTFLoader();
		this.textureLoader = new THREE.TextureLoader();
		this.audioLoader = new THREE.AudioLoader();
		this.dracoLoader = new DRACOLoader();
		this.dracoLoader.setDecoderPath(import.meta.env.BASE_URL + 'draco/');
		this.gltfLoader.setDRACOLoader(this.dracoLoader);
		this.loadDefaultAssets();
		this.loadAssets();
	}

	loadDefaultAssets() {
		this.noiseTexture = this.textureLoader.load(noiseTexture);
		this.noiseTexture.wrapS = this.noiseTexture.wrapT = THREE.RepeatWrapping;
	}

	loadAssets() {
		const assets = this.game.world.assets;
		this.toLoad = Object.keys(assets).length;

		//assets is an object with keys as asset names and values as asset urls
		for (const [name, url] of Object.entries(assets)) {
			this.loadAsset({ name, url });
		}
	}

	loadAsset(asset) {
		const fileExtension = asset.url.split(".").pop();
		const name = asset.name;

		if (/glb/.test(fileExtension)) {
			this.gltfLoader.load(asset.url, (gltf) => {
				this.game.world.assets[name] = gltf;
				this.sourceLoaded(name);
			});
		}

		if (/png|jpg|jpeg/.test(fileExtension)) {
			this.textureLoader.load(asset.url, (texture) => {
				texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
				this.game.world.assets[name] = texture;
				this.sourceLoaded(name);
			});
		}

		if (/mp3|wav|ogg/.test(fileExtension)) {
			this.audioLoader.load(asset.url, (buffer) => {
				this.game.world.assets[name] = buffer;
				this.sourceLoaded(name);
			});
		}

		if (/mp4/.test(fileExtension)) {
			const element = this.createVideoElement(asset.url);
			const playPromise = element.play();

			if (playPromise !== undefined) {
				playPromise
					.then((_) => {})
					.catch((error) => {
						console.log("Autoplay rejected", error);
					});
			}
			// Create the video texture
			const texture = new THREE.VideoTexture(element);
			// texture.colorSpace = THREE.LinearSRGBColorSpace;
			texture.generateMipmaps = false;
			texture.magFilter = THREE.NearestFilter;
			this.game.world.assets[name] = texture;

			this.sourceLoaded(name);
		}
	}

	async sourceLoaded(name) {
		this.loaded++;

		emitter.emit("file-loaded", {
			itemsLoaded: this.loaded,
			itemsTotal: this.toLoad,
			item: name,
		});

		if (this.loaded === this.toLoad) {
			await this.game.world.init();

			// Auto-start non-positional audio buffers (if any were loaded).
			// Requires an AudioListener attached to the player's camera (Camera.js).
			try {
				const listener = this.game.player && this.game.player.camera && this.game.player.camera.listener;
					if (listener) {
					for (const [key, asset] of Object.entries(this.game.world.assets)) {
						// Debug: announce asset inspection
						console.log("ResourceLoader: inspecting asset for audio:", key, asset);
						// Detect decoded AudioBuffer. Use instanceof when available, fallback to duck-typing.
						const isAudioBuffer =
							(typeof AudioBuffer !== "undefined" && asset instanceof AudioBuffer) ||
							(asset && typeof asset.copyFromChannel === "function" && typeof asset.sampleRate === "number");
						if (isAudioBuffer) {
							console.log("ResourceLoader: audio buffer detected for", key);
							const sound = new THREE.Audio(listener);
							sound.setBuffer(asset);
							sound.setLoop(true);
							sound.setVolume(1.0);
							// If the AudioContext is already running, attempt to play immediately.
							// Otherwise queue the sound to be played after a user gesture resumes the context.
							try {
								const ctx = listener && listener.context;
								if (ctx && ctx.state === "running") {
									console.log("ResourceLoader: AudioContext running — playing", key);
									sound.play();
									console.log("ResourceLoader: sound.isPlaying for", key, sound.isPlaying);
								} else {
									// queue for later playback
									this.game.world._queuedAudio = this.game.world._queuedAudio || [];
									this.game.world._queuedAudio.push(sound);
									console.log("ResourceLoader: queued sound for later playback:", key);
								}
							} catch (err) {
								console.warn("Audio play/queue failed for", key, err);
							}
							// Keep reference so it can be controlled/stopped later.
							this.game.world.assets[`${key}_audio`] = sound;
						}
					}
				} else {
					console.warn("No AudioListener found on player camera; loaded audio will not auto-play.");
				}
			} catch (err) {
				console.error("Error while attempting to auto-play audio:", err);
			}

			gameState.value = "ready";
		}
	}

	createVideoElement(url) {
		const element = document.createElement("video");
		element.src = url;
		element.autoplay = true;
		element.playsInline = true;
		element.muted = true;
		element.loop = true;

		return element;
	}
}
