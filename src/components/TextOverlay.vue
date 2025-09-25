<template>
  <transition name="fade">
    <div v-if="visible" class="text-overlay">
      <div class="text-panel" v-html="text"></div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { emitter } from "../game/Emitter";

const visible = ref(false);
const text = ref("");

// show text (fades in)
function onEnter(payload) {
  if (!payload || !payload.text) return;
  text.value = payload.text;
  visible.value = true;
}

// hide text (fade out)
function onExit(payload) {
  visible.value = false;
}

onMounted(() => {
  emitter.on("text-trigger-enter", onEnter);
  emitter.on("text-trigger-exit", onExit);
});

onUnmounted(() => {
  emitter.off("text-trigger-enter", onEnter);
  emitter.off("text-trigger-exit", onExit);
});
</script>

<style scoped>
.text-overlay {
  position: fixed;
  left: 50%;
  bottom: 12%;
  transform: translateX(-50%);
  pointer-events: none;
  z-index: 50;
  width: min(80%, 720px);
  display: flex;
  justify-content: center;
}

.text-panel {
  pointer-events: auto;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 18px 22px;
  border-radius: 10px;
  font-size: 1.05rem;
  line-height: 1.4;
  text-align: left;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
  max-height: 40vh;
  overflow-y: auto;
}

/* fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 350ms ease, transform 350ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
