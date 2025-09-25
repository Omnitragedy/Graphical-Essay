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

      this.triggers.push({
        id,
        node,
        text,
        radius,
        state: "idle", // "idle" | "active"
        lastStateChange: 0,
      });
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
    }
  }

  dispose() {
    // nothing to dispose for now - the emitter listeners live in UI
    this.triggers.length = 0;
  }
}
