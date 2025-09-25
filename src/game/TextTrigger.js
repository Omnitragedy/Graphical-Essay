import * as THREE from "three";
import { emitter } from "./Emitter";
import { TEXT_TRIGGER_MAP } from "./TextTriggerMap";

/**
 * TextTrigger
 *
 * Scans the scene for nodes whose name starts with "TextTrigger".
 * Each trigger can provide userData fields:
 *  - text: string (the text to display)
 *  - radius: number (activation radius in meters)
 *
 * If userData.text is missing, the node name (minus the prefix) will be used.
 *
 * Emits:
 *  - "text-trigger-enter" -> { id, text }
 *  - "text-trigger-exit"  -> { id }
 *
 * Usage:
 *  const tt = new TextTrigger(world);
 *  world.updatables.push(tt);
 */
export default class TextTrigger {
  constructor(world, options = {}) {
    this.world = world;
    this.game = world.game;
    this.scene = world.scene;
    this.player = this.game.player;
    this.camera = this.player.camera.instance;

    this.triggers = [];
    this.tempVec = new THREE.Vector3();

    this.defaultRadius = options.defaultRadius || 5.0;
    this.debounceTime = options.debounceTime || 200; // ms

    this._scanScene();
  }

  _scanScene() {
    // allow override of arrow offset/scale via options on the TextTrigger constructor
    this.arrowOffset = this.arrowOffset || 4.5;
    this.arrowScale = this.arrowScale || 1.5;

    const nodes = [];
    this.scene.traverse((obj) => {
      if (typeof obj.name === "string" && obj.name.startsWith("TextTrigger")) {
        nodes.push(obj);
      }
    });

    nodes.forEach((node) => {
      const rawId = node.name.replace("TextTrigger", "") || node.uuid;
      const id = rawId.replace(/^_+/, ""); // remove leading underscores if present

      // mark this node and its subtree as non-physical so the collider builder will skip them
      try {
        node.traverse((c) => {
          c.userData = c.userData || {};
          c.userData.nonphysical = true;
        });
      } catch (e) {
        // ignore traversal errors
        node.userData = node.userData || {};
        node.userData.nonphysical = true;
      }

      const userData = node.userData || {};
      const text = userData.text || (TEXT_TRIGGER_MAP && TEXT_TRIGGER_MAP[id]) || id || node.name;
      const radius = userData.radius ? Number(userData.radius) : this.defaultRadius;

      const trigger = {
        id,
        node,
        text,
        radius,
        state: "idle", // "idle" | "active"
        lastStateChange: 0,
        arrow: null,
      };

      // Create a simple red arrow (shaft + head) and position it above the trigger node.
      // The arrow points towards the trigger node (i.e., down toward the node).
      try {
        const arrowGroup = new THREE.Group();

        // shaft
        const shaftGeom = new THREE.CylinderGeometry(0.05 * this.arrowScale, 0.05 * this.arrowScale, 1.2 * this.arrowScale, 8);
        const shaftMat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0x440000 });
        const shaft = new THREE.Mesh(shaftGeom, shaftMat);
        shaft.position.y = -0.6 * this.arrowScale; // relative to group origin (we will place group above node)
        arrowGroup.add(shaft);

        // head
        const headGeom = new THREE.ConeGeometry(0.18 * this.arrowScale, 0.4 * this.arrowScale, 12);
        const headMat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0x660000 });
        const head = new THREE.Mesh(headGeom, headMat);
        head.position.y = -1.4 * this.arrowScale; // tip points further down
        head.rotation.x = Math.PI;
        arrowGroup.add(head);

        // scale and initial placement
        arrowGroup.scale.set(1, 1, 1);

        // compute world position of the node and place the arrow above it
        const worldPos = new THREE.Vector3();
        node.getWorldPosition(worldPos);
        arrowGroup.position.copy(worldPos).add(new THREE.Vector3(0, this.arrowOffset, 0));
        // give this trigger a random bobbing phase and configurable bob params
        trigger.bobPhase = Math.random() * Math.PI * 2;
        trigger.bobAmplitude = userData.bobAmplitude ? Number(userData.bobAmplitude) : 0.25;
        trigger.bobSpeed = userData.bobSpeed ? Number(userData.bobSpeed) : 0.5;

        // keep the arrow vertical so it always points straight down (no horizontal rotation)
        arrowGroup.rotation.set(0, 0, 0);

        // ensure the arrow doesn't cast/receive shadows (optional)
        arrowGroup.traverse((m) => {
          if (m.isMesh) {
            m.castShadow = false;
            m.receiveShadow = false;
          }
        });

        // add to scene and store reference on the trigger
        this.scene.add(arrowGroup);
        trigger.arrow = arrowGroup;
      } catch (e) {
        // if anything goes wrong creating the arrow, continue without it
        console.warn("TextTrigger: failed to create arrow for", id, e);
      }

      this.triggers.push(trigger);
    });
  }

  tick() {
    if (!this.triggers.length) return;

    const camPos = new THREE.Vector3();
    this.camera.getWorldPosition(camPos);

    const now = performance.now();

    for (const t of this.triggers) {
      const triggerPos = this.tempVec;
      t.node.getWorldPosition(triggerPos);

      const dist = camPos.distanceTo(triggerPos);
      const inProximity = dist <= t.radius;

      if (inProximity && t.state === "idle") {
        if (now - t.lastStateChange >= this.debounceTime) {
          t.state = "active";
          t.lastStateChange = now;
          emitter.emit("text-trigger-enter", { id: t.id, text: t.text });
        }
      } else if (!inProximity && t.state === "active") {
        if (now - t.lastStateChange >= this.debounceTime) {
          t.state = "idle";
          t.lastStateChange = now;
          emitter.emit("text-trigger-exit", { id: t.id });
        }
      }

      // Keep arrow positioned above the trigger and oriented toward the node.
      if (t.arrow) {
        // update world position in case the node or world moves
        t.node.getWorldPosition(triggerPos);
        const baseY = triggerPos.y + this.arrowOffset;
        const bob = Math.sin((now / 1000) * (t.bobSpeed || 0.5) * Math.PI * 2 + (t.bobPhase || 0)) * (t.bobAmplitude ?? 0.5);
        t.arrow.position.set(triggerPos.x, baseY + bob, triggerPos.z);
        // keep arrow pointing straight down; do not re-orient it toward the camera/player
        t.arrow.rotation.set(0, 0, 0);
      }
    }
  }

  dispose() {
    // remove arrows from the scene and dispose geometries/materials
    for (const t of this.triggers) {
      if (t.arrow) {
        t.arrow.traverse((m) => {
          if (m.isMesh) {
            if (m.geometry) m.geometry.dispose();
            if (m.material) {
              if (Array.isArray(m.material)) {
                m.material.forEach((mat) => mat.dispose && mat.dispose());
              } else {
                m.material.dispose && m.material.dispose();
              }
            }
          }
        });
        if (t.arrow.parent) t.arrow.parent.remove(t.arrow);
        t.arrow = null;
      }
    }
    this.triggers.length = 0;
  }
}
