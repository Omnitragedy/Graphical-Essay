import Game from "./Game";
import * as THREE from "three";
import { buildCollider } from "./utils/buildCollider";
import levelModel from "#assets/models/level.glb?url";
import GhibliGrass from "./environment/GhibliGrass";
import heightMap from "#assets/textures/heightMap.png";
import grassTexture from "#assets/textures/grass.jpg";

export default class World {
	constructor() {
		this.game = new Game();
		this.scene = this.game.scene;
		this.assets = {
			level: levelModel,
			heightMap: heightMap,
			grassTexture: grassTexture,
		};

		this.updatables = [];
		this.topFloorObjects = [];
		this.breathables = [];

		this.MAIN_LAYER = 0;
		this.ENVIRONMENT_LAYER = 3;
		this.BACKGROUND_LAYER = 5;
		this.INTERIOR_LAYER = 6;
	}

	async init() {
		this.setCollider();

		this.game.scene.background = new THREE.Color("purple");

		this.assets.heightMap.flipY = false;
		this.assets.heightMap.colorSpace = THREE.SRGBColorSpace;
		this.assets.heightMap.needsUpdate = true;

		this.assets.heightMap.wrapS = this.assets.heightMap.wrapT =
			THREE.MirroredRepeatWrapping;

		this.assets.grassTexture.wrapS = this.assets.grassTexture.wrapT =
			THREE.MirroredRepeatWrapping;

		this.scene.add(this.assets.level.scene);

		this.setGrass();
	}

	tick() {}

	setGrass() {
		const landscapeMesh = this.assets.level.scene.getObjectByName("Landscape");
		landscapeMesh.material = new THREE.MeshBasicMaterial({
			wireframe: true,
		});
		this.grass = new GhibliGrass(landscapeMesh);
	}

	setCollider() {
		this.game.player.controls.collider = buildCollider(this.assets.level.scene);
	}

	onRender() {
		const camera = this.game.player.camera.instance;
		const renderer = this.game.renderer.instance;
		const scene = this.scene;
		renderer.render(scene, camera);
	}
}
