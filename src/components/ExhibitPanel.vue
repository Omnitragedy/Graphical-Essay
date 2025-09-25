<template>
  <div v-show="visible" class="fixed right-4 top-16 w-80 bg-black/70 backdrop-blur-md rounded-lg overflow-hidden text-white z-40 transition-opacity duration-300"
       :class="{ 'opacity-100': visible, 'opacity-0 pointer-events-none': !visible }">
    <div class="p-3">
      <div class="text-sm text-gray-300 mb-2">{{ title }}</div>
      <div class="w-full h-48 bg-gray-900 flex items-center justify-center overflow-hidden">
        <img v-if="image" :src="image" class="max-w-full max-h-full object-contain" />
        <div v-else class="text-gray-500">Loading...</div>
      </div>
      <div class="mt-2 text-xs text-gray-400">{{ description }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { emitter } from '../game/Emitter';

const visible = ref(false);
const image = ref('');
const title = ref('');
const description = ref('');

let onFocus = (payload) => {
  title.value = payload.title || payload.id || '';
  image.value = payload.image || '';
  description.value = payload.description || '';
  visible.value = true;
};

let onBlur = () => {
  visible.value = false;
  // optionally clear image to free memory if you prefer:
  // image.value = '';
};

onMounted(() => {
  emitter.on('exhibit-focus', onFocus);
  emitter.on('exhibit-blur', onBlur);
});

onBeforeUnmount(() => {
  emitter.off('exhibit-focus', onFocus);
  emitter.off('exhibit-blur', onBlur);
});
</script>

<style scoped>
/* Simple default styling; project uses Tailwind but this ensures reasonable fallback */
.fixed {
  transition: opacity 200ms ease;
}
</style>
