import * as THREE from "three";
import {
	computeBoundsTree,
	disposeBoundsTree,
	computeBatchedBoundsTree,
	disposeBatchedBoundsTree,
	acceleratedRaycast,
} from "three-mesh-bvh";
import Renderer from "./Renderer";
import Debug from "./Debug";
import Time from "./Time";
import Sizes from "./Sizes";
import { emitter } from "./Emitter";
import World from "./World";
import Player from "./Player";
import EffectComposer from "./EffectComposer";
import ResourceLoader from "./ResourceLoader";
import { gameState } from "./State";
import VR from "./VR";

let gameInstance = null;

export default class Game {
	constructor() {
		// Singleton
		if (gameInstance) {
			return gameInstance;
		}

		this.isLocal = /localhost|192/.test(window.location.hostname);

		gameInstance = this;
		window.gameInstance = this;

		// Canvas
		this.canvas = document.querySelector("canvas.webgl");

		THREE.ColorManagement.enabled = true;

		// Add the extension functions
		THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
		THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
		THREE.Mesh.prototype.raycast = acceleratedRaycast;

		THREE.BatchedMesh.prototype.computeBoundsTree = computeBatchedBoundsTree;
		THREE.BatchedMesh.prototype.disposeBoundsTree = disposeBatchedBoundsTree;
		THREE.BatchedMesh.prototype.raycast = acceleratedRaycast;
	}

	async setAutoQuality() {
		this.gpuTier = await getGPUTier();

		// switch (this.gpuTier.tier) {
		// 	case 0:
		// 		settings.quality = "low";
		// 		break;
		// 	case 1:
		// 		settings.quality = "low";
		// 		break;
		// 	case 2:
		// 		settings.quality = "medium";
		// 		break;
		// 	case 3:
		// 		settings.quality = "high";
		// 		break;
		// }
	}

	init() {
		//world arrays
		this.updatables = [];
		this.disposables = [];
		this.scene = new THREE.Scene();

		this.debug = new Debug();
		this.sizes = new Sizes();
		this.time = new Time();
		this.world = new World();
		this.player = new Player();

		this.scene.add(this.player.instance);

		this.renderer = new Renderer();
		this.effectComposer = new EffectComposer();
		this.resourceLoader = new ResourceLoader();
		this.vr = new VR();

		this.time.tick();

		emitter.on("resize", (sizes) => {
			this.player.camera.resize();
			this.renderer.resize();
			this.effectComposer.resize();
		});

		emitter.on("pointerUnlock", () => {
			if (gameState.value == "playing") {
				gameState.value = "paused";
			}
		});
	}
}
