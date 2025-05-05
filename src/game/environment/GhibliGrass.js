import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";
import Game from "../Game";
import * as THREE from "three";
import vertexShader from "#game/shaders/grass/vertex.glsl?raw";
import fragmentShader from "#game/shaders/grass/fragment.glsl?raw";
import { settings } from "../Settings";

export default class GhibliGrass {
	constructor(landscapeMesh) {
		this.game = new Game();
		this.landscapeMesh = landscapeMesh;
		this.sampler = new MeshSurfaceSampler(landscapeMesh).build();
		this.center = new THREE.Vector3();

		this.settings = {
			count: settings.vr ? 160000 : 200000,
			bladeHeight: 0.005,
			bladeWidth: 0.08,
			material: THREE.MeshBasicMaterial,
			patchSize: 20,
		};

		this.rowCount = Math.floor(Math.sqrt(this.settings.count));

		this.landscapeMesh.geometry.computeBoundingBox();
		this.landscapeMesh.geometry.boundingBox.getCenter(this.center);

		this.buildGrass();

		this.game.world.updatables.push(this);

		this.setDebug();
	}

	buildGrass() {
		const positions = [];
		const colors = [];
		const uvs = [];
		const indices = [];
		const bladeOrigins = [];
		const yaws = [];
		const currentPosition = new THREE.Vector3();
		const uv = new THREE.Vector2();
		const yawUnitVec = new THREE.Vector3();

		for (let i = 0; i < this.settings.count; i++) {
			currentPosition.x = THREE.MathUtils.randFloat(
				-this.settings.patchSize * 0.5,
				this.settings.patchSize * 0.5
			);

			currentPosition.z = THREE.MathUtils.randFloat(
				-this.settings.patchSize * 0.5,
				this.settings.patchSize * 0.5
			);

			uv.set(
				THREE.MathUtils.mapLinear(
					currentPosition.x,
					this.landscapeMesh.geometry.boundingBox.min.x,
					this.landscapeMesh.geometry.boundingBox.max.x,
					0,
					1
				),
				THREE.MathUtils.mapLinear(
					currentPosition.z,
					this.landscapeMesh.geometry.boundingBox.min.z,
					this.landscapeMesh.geometry.boundingBox.max.z,
					0,
					1
				)
			);

			const yaw = Math.random() * Math.PI * 2;
			yawUnitVec.set(Math.sin(yaw), 0, -Math.cos(yaw));

			const bl = currentPosition;
			const br = currentPosition;
			const tc = currentPosition;

			const verts = [
				{ pos: bl.toArray(), color: [0.1, 0, 0] },
				{ pos: br.toArray(), color: [0, 0, 0.1] },
				{ pos: tc.toArray(), color: [1, 1, 1] },
			];

			const vertexCount = verts.length;

			const vArrOffset = i * vertexCount;

			verts.forEach((vert, index) => {
				positions.push(...vert.pos);
				colors.push(...vert.color);
				uvs.push(...uv.toArray());
				yaws.push(...yawUnitVec);
				bladeOrigins.push(...currentPosition.toArray());
			});

			// Add indices
			indices.push(vArrOffset, vArrOffset + 1, vArrOffset + 2);
		}

		const geometry = new THREE.BufferGeometry();

		geometry.setAttribute(
			"position",
			new THREE.BufferAttribute(new Float32Array(positions), 3)
		);

		geometry.setAttribute(
			"color",
			new THREE.BufferAttribute(new Float32Array(colors), 3)
		);

		geometry.setAttribute(
			"uv",
			new THREE.BufferAttribute(new Float32Array(uvs), 2)
		);

		geometry.setAttribute(
			"aYaw",
			new THREE.BufferAttribute(new Float32Array(yaws), 3)
		);

		geometry.setAttribute(
			"aBladeOrigin",
			new THREE.BufferAttribute(new Float32Array(bladeOrigins), 3)
		);

		// geometry.setIndex(indices);
		geometry.computeVertexNormals();

		const material = this.setMaterial();

		this.mesh = new THREE.Mesh(geometry, material);

		this.game.player.instance.add(this.mesh);

		this.mesh.frustumCulled = false;
	}

	setMaterial() {
		const material = new THREE.ShaderMaterial({
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
			vertexColors: true,
			side: THREE.DoubleSide,
			uniforms: {
				uTime: { value: 0 },
				uNoiseTexture: { value: this.game.resourceLoader.noiseTexture },
				uDiffuseMap: { value: this.game.world.assets.grassTexture },
				uPlayerPosition: { value: new THREE.Vector3() },
				uHeightMap: { value: this.game.world.assets.heightMap },
				uBoundingBoxMin: { value: this.landscapeMesh.geometry.boundingBox.min },
				uBoundingBoxMax: { value: this.landscapeMesh.geometry.boundingBox.max },
				uPatchSize: { value: this.settings.patchSize },
				uBladeWidth: { value: this.settings.bladeWidth },
				uWindDirection: { value: Math.PI * 0.25 },
				uWindSpeed: { value: 0.3 },
				uWindNoiseScale: { value: 0.9 },
				uBaldPatchModifier: { value: 2.5 },
				uFalloffSharpness: { value: 0.35 },
				uHeightNoiseFrequency: { value: 12 },
				uHeightNoiseAmplitude: { value: 3 },
				uMaxBendAngle: { value: 22 },
				uMaxBladeHeight: { value: 0.35 },
				uRandomHeightAmount: { value: 0.25 },
			},
		});

		return material;
	}

	tick() {
		this.mesh.material.uniforms.uTime.value = this.game.time.elapsed;
		this.mesh.material.uniforms.uPlayerPosition.value.copy(
			this.game.player.instance.position
		);
	}

	setDebug() {
		const folder = this.game.debug.ui.addFolder("Ghibli Grass");
		folder
			.add(
				this.mesh.material.uniforms.uWindDirection,
				"value",
				-Math.PI,
				Math.PI
			)
			.name("Wind Direction");
		folder
			.add(this.mesh.material.uniforms.uWindSpeed, "value", 0, 3)
			.name("Wind Speed");
		folder
			.add(this.mesh.material.uniforms.uWindNoiseScale, "value", 0, 10)
			.name("Wind Noise Scale");
		folder
			.add(this.mesh.material.uniforms.uBaldPatchModifier, "value", -5, 5)
			.name("Bald Patch Modifier");
		folder
			.add(this.mesh.material.uniforms.uFalloffSharpness, "value", -1, 1)
			.name("Falloff Sharpness");
		folder
			.add(this.mesh.material.uniforms.uHeightNoiseFrequency, "value", 0, 100)
			.name("Height Noise Frequency");
		folder
			.add(this.mesh.material.uniforms.uHeightNoiseAmplitude, "value", 0, 10)
			.name("Height Noise Amplitude");
		folder
			.add(this.mesh.material.uniforms.uMaxBendAngle, "value", 0, 90)
			.name("Max Bend Angle");
		folder
			.add(this.mesh.material.uniforms.uBladeWidth, "value", 0, 1)
			.name("Blade Width");
		folder
			.add(this.mesh.material.uniforms.uMaxBladeHeight, "value", 0, 1)
			.name("Max Blade Height");
		folder
			.add(this.mesh.material.uniforms.uRandomHeightAmount, "value", 0, 10)
			.name("Random Height Amount");

		folder.close();
	}
}
