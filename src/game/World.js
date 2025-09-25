import Game from "./Game";
import * as THREE from "three";
import { buildCollider } from "./utils/buildCollider";
import levelModel from "#assets/models/test.glb?url";
import heightMap from "#assets/textures/heightMap.png";
import leCygneAudio from "#assets/models/Le_cygne.ogg?url";
import TextTrigger from "./TextTrigger";

export default class World {
	constructor() {
		this.game = new Game();
		this.scene = this.game.scene;
		this.assets = {
			level: levelModel,
			heightMap: heightMap,
			Le_cygne: leCygneAudio
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

		// Nighttime sky: dark background + starfield (points) + low ambient lighting
		// set a dark background color for a nighttime feel
		this.game.scene.background = new THREE.Color(0x03020a);



		// Basic scene lighting (single set of lights affecting the whole scene)
		// simple hemisphere fill
		const hemi = new THREE.HemisphereLight(0x111122, 0x000000, 0.25);
		hemi.position.set(0, 50, 0);
		this.scene.add(hemi);

		// directional moon/key light
		const moon = new THREE.DirectionalLight(0xddeeff, 0.25);
		moon.position.set(-30, 40, 10);
		moon.castShadow = false;
		this.scene.add(moon);

		// subtle ambient fill so the level isn't fully dark
		const envAmbient = new THREE.AmbientLight(0xffffff, 0.08);
		this.scene.add(envAmbient);

		// create a starfield using Points so it stays in the far distance
		const starCount = 1000;
		const positions = new Float32Array(starCount * 3);
		const radiusMin = 40;
		const radiusRange = 300;

		for (let i = 0; i < starCount; i++) {
			// distribute on a sphere shell for even coverage
			const u = Math.random();
			const v = Math.random();
			const theta = 2 * Math.PI * u;
			const phi = Math.acos(2 * v - 1);
			const r = radiusMin + Math.random() * radiusRange;

			const x = r * Math.sin(phi) * Math.cos(theta);
			const y = r * Math.cos(phi);
			const z = r * Math.sin(phi) * Math.sin(theta);

			positions[i * 3] = x;
			positions[i * 3 + 1] = y;
			positions[i * 3 + 2] = z;
		}

		const starsGeom = new THREE.BufferGeometry();
		starsGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));

		const starsMat = new THREE.PointsMaterial({
			color: 0xffffff,
			size: 0.6,
			sizeAttenuation: true,
			transparent: true,
			opacity: 0.9,
			depthWrite: false,
		});

		const stars = new THREE.Points(starsGeom, starsMat);
		this.scene.add(stars);

		// subtle slow rotation for parallax movement (optional)
		this.updatables.push({
			tick: () => {
				stars.rotation.y += 0.0005;
			},
		});

		this.assets.heightMap.flipY = false;
		this.assets.heightMap.colorSpace = THREE.SRGBColorSpace;
		this.assets.heightMap.needsUpdate = true;

		this.assets.heightMap.wrapS = this.assets.heightMap.wrapT =
			THREE.MirroredRepeatWrapping;


		// (Removed layer-based Plane assignment — let model materials/light handle appearance)

		this.scene.add(this.assets.level.scene);


		// initialize text triggers (finds TextTrigger... nodes in the GLB)
		this.textTriggers = new TextTrigger(this);
		this.updatables.push(this.textTriggers);

		// rebuild collider after marking TextTrigger nodes as non-physical so the player can walk through them
		this.setCollider();

	}

	tick() {}


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
